"use client";

import { useActionState, useRef, useState } from "react";
import { EditorDocumento } from "@/components/EditorDocumento";
import { MapaMental } from "@/components/MapaMental";
import { Mensagem, type EstadoFormulario } from "@/components/ui/Mensagem";
import { botaoIcone, botaoPrimario, botaoTexto, campo, rotulo } from "@/components/ui/estilos";
import { validarDocumento, type Documento } from "@/lib/documento";
import { mapaDoDocumento } from "@/lib/documento/mapa";
import { cores, LIMITES, novoId, ordemCores, type Cor, type Mapa, type No } from "@/lib/mapas";
import { documentoDoResumo, type Resumo } from "@/lib/resumos";

type AulaOpcao = { id: string; rotulo: string };

/** Troca o nó no caminho (índices a partir dos ramos) usando `mudar`. */
function atualizarNo(mapa: Mapa, caminho: number[], mudar: (n: No) => No | null): Mapa {
  const andar = (lista: No[], [i, ...resto]: number[]): No[] => {
    const copia = [...lista];
    if (resto.length === 0) {
      const novo = mudar(copia[i]);
      if (novo) copia[i] = novo;
      else copia.splice(i, 1);
    } else {
      copia[i] = { ...copia[i], filhos: andar(copia[i].filhos, resto) };
    }
    return copia;
  };
  return { ...mapa, ramos: andar(mapa.ramos, caminho) as Mapa["ramos"] };
}

function EditorNo({
  no,
  caminho,
  nivel,
  cor,
  aoMudar,
}: {
  no: No;
  caminho: number[];
  nivel: number;
  cor: Cor;
  aoMudar: (caminho: number[], mudar: (n: No) => No | null) => void;
}) {
  const podeFilho = nivel < LIMITES.profundidade && no.filhos.length < LIMITES.filhos;
  return (
    <li>
      <div className="flex items-center gap-2">
        <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: cores[cor].traco }} />
        <input
          value={no.texto}
          maxLength={LIMITES.texto}
          onChange={(e) => aoMudar(caminho, (n) => ({ ...n, texto: e.target.value }))}
          placeholder={nivel === 1 ? "Ramo" : "Detalhe"}
          aria-label={nivel === 1 ? "Texto do ramo" : "Texto do detalhe"}
          className={`${campo} py-1.5`}
        />
        {podeFilho && (
          <button
            type="button"
            title="Adicionar detalhe"
            aria-label="Adicionar detalhe"
            className={botaoIcone}
            onClick={() =>
              aoMudar(caminho, (n) => ({ ...n, filhos: [...n.filhos, { id: novoId(), texto: "", filhos: [] }] }))
            }
          >
            +
          </button>
        )}
        <button
          type="button"
          title="Remover"
          aria-label="Remover"
          className={botaoIcone}
          onClick={() => aoMudar(caminho, () => null)}
        >
          ×
        </button>
      </div>
      {no.filhos.length > 0 && (
        <ul className="mt-2 space-y-2 border-l-2 pl-4" style={{ borderColor: cores[cor].fundo }}>
          {no.filhos.map((f, i) => (
            <EditorNo key={f.id} no={f} caminho={[...caminho, i]} nivel={nivel + 1} cor={cor} aoMudar={aoMudar} />
          ))}
        </ul>
      )}
    </li>
  );
}

/** Editor de resumo (página com títulos e destaques) + mapa mental opcional. Serve ao professor (turma, com aulas) e ao aluno (matéria, sem aulas). */
export function EditorResumo({
  salvar,
  ocultos,
  aulas,
  resumo,
  aulaInicial,
}: {
  salvar: (estado: EstadoFormulario, formData: FormData) => Promise<EstadoFormulario>;
  ocultos: Record<string, string>;
  aulas?: AulaOpcao[];
  resumo?: Resumo;
  aulaInicial?: string;
}) {
  const [estado, acao, enviando] = useActionState(salvar, null);
  const [mapa, setMapa] = useState<Mapa>(resumo?.mapa ?? { centro: "", ramos: [] });
  const [mapaAberto, setMapaAberto] = useState(!!(resumo?.mapa?.centro || resumo?.mapa?.ramos?.length));
  const docInicial = documentoDoResumo(resumo ?? { conteudo: null, texto: "" });
  const docAtual = useRef<Documento>(docInicial);
  const [titulo, setTitulo] = useState(resumo?.titulo ?? "");
  const [aviso, setAviso] = useState("");

  const gerarMapa = () => {
    const doc = validarDocumento(docAtual.current);
    const novo = doc ? mapaDoDocumento(doc, titulo) : null;
    if (!novo || novo.ramos.length === 0) {
      setAviso("Escreva o resumo com títulos, subtítulos ou listas para gerar o mapa.");
      return;
    }
    const temAlgo = mapa.centro || mapa.ramos.length > 0;
    if (temAlgo && !window.confirm("Trocar o mapa mental atual pelo mapa gerado a partir do resumo?")) return;
    setMapa(novo);
    setMapaAberto(true);
    setAviso("Mapa gerado. Ajuste o que quiser e salve.");
  };

  const aoMudar = (caminho: number[], mudar: (n: No) => No | null) => setMapa((m) => atualizarNo(m, caminho, mudar));
  const adicionarRamo = () =>
    setMapa((m) => ({
      ...m,
      ramos: [...m.ramos, { id: novoId(), texto: "", filhos: [], cor: ordemCores[m.ramos.length % ordemCores.length] }],
    }));
  const trocarCor = (i: number, cor: Cor) =>
    setMapa((m) => ({ ...m, ramos: m.ramos.map((r, j) => (j === i ? { ...r, cor } : r)) }));

  // Pré-visualização só com o que já tem texto.
  const limpar = (n: No): No | null => {
    if (!n.texto.trim()) return null;
    return { ...n, filhos: n.filhos.flatMap((f) => limpar(f) ?? []) };
  };
  const previa: Mapa = {
    centro: mapa.centro,
    ramos: mapa.ramos.flatMap((r) => {
      const l = limpar(r);
      return l ? [{ ...l, cor: r.cor }] : [];
    }),
  };

  return (
    <form action={acao} className="space-y-6">
      {Object.entries(ocultos).map(([nome, valor]) => (
        <input key={nome} type="hidden" name={nome} value={valor} />
      ))}
      {resumo && <input type="hidden" name="id" value={resumo.id} />}
      <input type="hidden" name="mapa" value={JSON.stringify(mapa)} />

      <div className={`grid gap-4 ${aulas ? "sm:grid-cols-2" : ""}`}>
        <div>
          <label htmlFor="titulo" className={rotulo}>
            Título
          </label>
          <input
            id="titulo"
            name="titulo"
            maxLength={200}
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className={campo}
          />
        </div>
        {aulas && (
        <div>
          <label htmlFor="aula_id" className={rotulo}>
            Aula
          </label>
          <select id="aula_id" name="aula_id" defaultValue={resumo?.aula_id ?? aulaInicial ?? ""} className={campo}>
            <option value="">Sem aula específica</option>
            {aulas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.rotulo}
              </option>
            ))}
          </select>
        </div>
        )}
      </div>


      <div>
        <p className={rotulo}>Resumo</p>
        <EditorDocumento nome="conteudo" inicial={docInicial} aoMudar={(d) => (docAtual.current = d)} />
        <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <button type="button" onClick={gerarMapa} className={botaoTexto}>
            ✦ Gerar mapa mental a partir do resumo
          </button>
          {aviso && (
            <span role="status" className="text-sm text-tinta-suave">
              {aviso}
            </span>
          )}
        </div>
      </div>

      <details
        open={mapaAberto}
        onToggle={(e) => setMapaAberto(e.currentTarget.open)}
        className="group rounded-2xl border border-linha p-5"
      >
        <summary className="cursor-pointer list-none text-lg font-bold">
          <span className="mr-2 inline-block text-primaria transition-transform group-open:rotate-90">›</span>
          Mapa mental <span className="text-sm font-normal text-tinta-suave">(opcional)</span>
        </summary>
        <p className="mt-1 text-sm text-tinta-suave">
          Escreva o tema no centro e os ramos ao redor. Use + para acrescentar detalhes a um ramo. A Repasa desenha o
          mapa sozinha.
        </p>
        <div className="mt-4">
          <label htmlFor="centro" className={rotulo}>
            Tema central
          </label>
          <input
            id="centro"
            value={mapa.centro}
            maxLength={LIMITES.texto}
            onChange={(e) => setMapa((m) => ({ ...m, centro: e.target.value }))}
            placeholder="Ex.: Pretérito imperfeito"
            className={campo}
          />
        </div>
        <ul className="mt-4 space-y-4">
          {mapa.ramos.map((r, i) => (
            <li key={r.id} className="rounded-xl bg-suave p-3">
              <fieldset className="mb-2 flex flex-wrap items-center gap-1.5">
                <legend className="sr-only">Cor do ramo</legend>
                {ordemCores.map((c) => (
                  <button
                    key={c}
                    type="button"
                    title={cores[c].nome}
                    aria-label={`Cor ${cores[c].nome}`}
                    aria-pressed={r.cor === c}
                    onClick={() => trocarCor(i, c)}
                    className={`size-5 rounded-full outline-offset-2 ${r.cor === c ? "outline-2 outline-tinta" : ""}`}
                    style={{ background: cores[c].traco }}
                  />
                ))}
              </fieldset>
              <ul>
                <EditorNo no={r} caminho={[i]} nivel={1} cor={r.cor} aoMudar={aoMudar} />
              </ul>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-2">
          {mapa.ramos.length < LIMITES.ramos && (
            <button type="button" onClick={adicionarRamo} className={botaoTexto}>
              + Adicionar ramo
            </button>
          )}
          {(mapa.centro || mapa.ramos.length > 0) && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Excluir o mapa mental deste resumo? O texto continua. Salve para confirmar.")) {
                  setMapa({ centro: "", ramos: [] });
                }
              }}
              className="text-sm font-bold text-erro underline-offset-4 hover:underline"
            >
              Excluir mapa mental
            </button>
          )}
        </div>
        {(previa.centro || previa.ramos.length > 0) && (
          <div className="mt-6">
            <p className="mb-2 text-sm font-bold text-tinta-suave">{aulas ? "Como os alunos vão ver" : "Pré-visualização"}</p>
            <MapaMental mapa={previa} />
          </div>
        )}
      </details>

      <Mensagem estado={estado} />
      <button type="submit" disabled={enviando} className={botaoPrimario}>
        {enviando ? "Salvando..." : resumo ? "Salvar resumo" : "Criar resumo"}
      </button>
    </form>
  );
}
