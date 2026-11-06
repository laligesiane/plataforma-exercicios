"use client";

import { fmt } from "@/i18n/config";
import { useDicionario } from "@/i18n/cliente";
import { useState, useTransition } from "react";
import { AulaAtividade } from "@/components/exercicios/AulaAtividade";
import { botaoPrimario, botaoSecundario, caixaMarcar, campo, rotulo } from "@/components/ui/estilos";
import { limparExercicio, problemasDaAtividade, type Exercicio } from "@/lib/atividades/modelo";
import { QUANTIDADES, tiposGeraveis, type TipoGeravel } from "@/lib/pratica/converter";
import { EditorExercicio, mover } from "@/app/professor/atividades/[id]/EditorAtividade";
import { gerarPratica, salvarPratica } from "./actions";

type Props = {
  /** Para gerar uma prática nova a partir deste resumo. */
  resumo?: { id: string; titulo: string };
  /** Para editar uma prática já salva. */
  pratica?: { id: string; titulo: string; exercicios: Exercicio[] };
};

const tiposPadrao: TipoGeravel[] = ["lacuna", "multipla_escolha"];

export function EditorPratica({ resumo, pratica }: Props) {
  const [tipos, setTipos] = useState<TipoGeravel[]>(tiposPadrao);
  const [quantidade, setQuantidade] = useState<number>(5);
  const [titulo, setTitulo] = useState(pratica?.titulo ?? "");
  const [exercicios, setExercicios] = useState<Exercicio[] | null>(pratica?.exercicios ?? null);
  const [aba, setAba] = useState<"editar" | "testar">("editar");
  const [erro, setErro] = useState("");
  const [problemas, setProblemas] = useState<string[]>([]);
  const [gerando, iniciarGeracao] = useTransition();
  const [salvando, iniciarSalvar] = useTransition();
  const dic = useDicionario();
  const tx = dic.praticas;

  function alternarTipo(tipo: TipoGeravel) {
    setTipos((atual) => (atual.includes(tipo) ? atual.filter((t) => t !== tipo) : [...atual, tipo]));
  }

  function gerar() {
    if (!resumo) return;
    setErro("");
    setProblemas([]);
    iniciarGeracao(async () => {
      const ordem = (Object.keys(tiposGeraveis) as TipoGeravel[]).filter((t) => tipos.includes(t));
      const r = await gerarPratica({ resumoId: resumo.id, tipos: ordem, quantidade });
      if (!r.ok) {
        setErro(r.erro);
        return;
      }
      setTitulo(r.titulo);
      setExercicios(r.exercicios);
      setAba("editar");
    });
  }

  function salvar() {
    if (!exercicios) return;
    const limpos = exercicios.map(limparExercicio);
    const lista = problemasDaAtividade(titulo, limpos);
    setProblemas(lista);
    if (lista.length > 0) {
      setErro(tx.ajustar);
      return;
    }
    setErro("");
    iniciarSalvar(async () => {
      const r = await salvarPratica({ id: pratica?.id, resumoId: resumo?.id ?? null, titulo, exercicios: limpos });
      // Só volta aqui se deu erro (no sucesso, a página muda).
      if (r) {
        setErro(r.erro);
        setProblemas(r.problemas ?? []);
      }
    });
  }

  const mensagens = (erro || problemas.length > 0) && (
    <div role="alert" className="mt-4 rounded-xl bg-erro-fundo px-3.5 py-2.5 text-sm text-erro">
      {erro && <p className="font-semibold">{erro}</p>}
      {problemas.length > 0 && (
        <ul className="mt-1 list-disc pl-5">
          {problemas.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div>
      {resumo && (
        <section className="rounded-2xl border border-linha p-5 sm:p-6">
          <h2 className="font-bold">{exercicios ? tx.gerarDeNovo : tx.oQueTreinar}</h2>
          <p className="mt-1 text-sm text-tinta-suave">
            {fmt(tx.iaLe, { titulo: resumo.titulo })}
          </p>
          <fieldset className="mt-4">
            <legend className={rotulo}>{tx.tipos}</legend>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {(Object.entries(tiposGeraveis) as [TipoGeravel, string][]).map(([tipo, nome]) => (
                <label key={tipo} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={tipos.includes(tipo)} onChange={() => alternarTipo(tipo)} className={caixaMarcar} />
                  {nome}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="mt-4">
            <legend className={rotulo}>{tx.itensPor}</legend>
            <div className="flex gap-2">
              {QUANTIDADES.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuantidade(q)}
                  aria-pressed={quantidade === q}
                  className={`rounded-full px-4 py-1.5 text-sm font-bold ${
                    quantidade === q ? "bg-tinta text-fundo" : "border border-linha text-tinta-suave hover:border-tinta"
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </fieldset>
          <button type="button" onClick={gerar} disabled={gerando || tipos.length === 0} className={`${botaoPrimario} mt-5`}>
            {gerando ? tx.gerando : exercicios ? tx.outraVersao : tx.gerarExercicios}
          </button>
          {exercicios && !gerando && (
            <p className="mt-2 text-xs text-tinta-suave">{tx.trocaAbaixo}</p>
          )}
        </section>
      )}

      {!exercicios && mensagens}

      {exercicios && (
        <section className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-extrabold">{pratica ? tx.editarPratica : tx.revise}</h2>
            <div className="flex gap-2" role="tablist">
              {(["editar", "testar"] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  role="tab"
                  aria-selected={aba === a}
                  onClick={() => setAba(a)}
                  className={`rounded-full px-4 py-1.5 text-sm font-bold ${
                    aba === a ? "bg-tinta text-fundo" : "border border-linha text-tinta-suave hover:border-tinta"
                  }`}
                >
                  {a === "editar" ? tx.editar : tx.experimentar}
                </button>
              ))}
            </div>
          </div>

          {aba === "editar" ? (
            <div className="mt-4 space-y-5">
              <div>
                <label htmlFor="titulo-pratica" className={rotulo}>
                  {tx.tituloPratica}
                </label>
                <input id="titulo-pratica" value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={200} className={campo} />
              </div>
              {exercicios.map((exercicio, i) => (
                <EditorExercicio
                  key={exercicio.id}
                  numero={i + 1}
                  total={exercicios.length}
                  exercicio={exercicio}
                  semMidia
                  onChange={(novo) => setExercicios(exercicios.map((e, j) => (j === i ? novo : e)))}
                  onMover={(d) => setExercicios(mover(exercicios, i, d))}
                  onCopiar={(novo) => setExercicios([...exercicios.slice(0, i + 1), novo, ...exercicios.slice(i + 1)])}
                  onRemover={() => setExercicios(exercicios.filter((_, j) => j !== i))}
                />
              ))}
              {exercicios.length === 0 && <p className="text-sm text-tinta-suave">{tx.apagouTodos}</p>}
            </div>
          ) : (
            <div className="mt-4">
              <p className="mb-4 rounded-xl bg-aviso-fundo px-3.5 py-2.5 text-sm">
                {tx.experimenteAviso}
              </p>
              <AulaAtividade key={JSON.stringify(exercicios).length} exercicios={exercicios.map(limparExercicio)} comBarra={false} />
            </div>
          )}

          {mensagens}

          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-linha pt-5">
            <button type="button" onClick={salvar} disabled={salvando || exercicios.length === 0} className={botaoPrimario}>
              {salvando ? dic.comum.salvando : tx.salvar}
            </button>
            {!pratica && (
              <button type="button" onClick={() => setExercicios(null)} disabled={salvando} className={botaoSecundario}>
                {tx.descartar}
              </button>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
