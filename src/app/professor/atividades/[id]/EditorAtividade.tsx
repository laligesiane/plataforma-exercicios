"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { AulaAtividade } from "@/components/exercicios/AulaAtividade";
import { CabecalhoAtividade } from "@/components/exercicios/CabecalhoAtividade";
import { botaoIcone, botaoPrimario, botaoSecundario, botaoTexto, caixaMarcar, campo, rotulo } from "@/components/ui/estilos";
import {
  categorias,
  limparExercicio,
  niveis,
  novoExercicio,
  novoId,
  novoItemArrastar,
  novoItemClassificar,
  novoItemLacuna,
  novoItemMultiplaEscolha,
  novoItemRelacionar,
  problemasDaAtividade,
  tiposExercicio,
  type Atividade,
  type Categoria,
  type Exercicio,
  type Nivel,
  type TipoExercicio,
} from "@/lib/atividades/modelo";
import { idiomas } from "@/lib/idiomas";
import { sugestoesMateria } from "@/lib/turmas";
import { apagarAtividade, salvarAtividade, type ResultadoSalvar } from "../actions";
import {
  CabecalhoItem,
  EditorArrastar,
  EditorClassificar,
  EditorLacuna,
  EditorMultipla,
  EditorRelacionar,
  ListaCurta,
  trocar,
} from "./EditorItens";
import { EditorMidia } from "./EditorMidia";

type Turma = { id: string; nome: string };

type Props = {
  inicial: Atividade;
  exerciciosIniciais: Exercicio[];
  turmas: Turma[];
  turmasIniciais: string[];
};

/** Deixa a atividade coerente com o tipo escolhido: idioma (sem matéria) ou matéria (sem idiomas). */
function paraSalvar(a: Atividade, tipo: "idioma" | "materia"): Atividade {
  if (tipo === "materia") return { ...a, idioma_ensinado: null, idioma_instrucao: null };
  return { ...a, materia: "", idioma_ensinado: a.idioma_ensinado ?? "es", idioma_instrucao: a.idioma_instrucao ?? "pt" };
}

function mover<T>(lista: T[], indice: number, direcao: -1 | 1) {
  const alvo = indice + direcao;
  if (alvo < 0 || alvo >= lista.length) return lista;
  const nova = [...lista];
  [nova[indice], nova[alvo]] = [nova[alvo], nova[indice]];
  return nova;
}

export function EditorAtividade({ inicial, exerciciosIniciais, turmas, turmasIniciais }: Props) {
  const [atividade, setAtividade] = useState(inicial);
  const [exercicios, setExercicios] = useState(exerciciosIniciais);
  const [turmasMarcadas, setTurmasMarcadas] = useState(turmasIniciais);
  const [modo, setModo] = useState<"editar" | "ver">("editar");
  const [alterado, setAlterado] = useState(false);
  const [resultado, setResultado] = useState<ResultadoSalvar | null>(null);
  const [salvando, iniciarSalvar] = useTransition();
  const [publicadaSalva, setPublicadaSalva] = useState(inicial.publicada);
  const [tipo, setTipo] = useState<"idioma" | "materia">(inicial.materia.trim() ? "materia" : "idioma");
  const atual = paraSalvar(atividade, tipo);

  useEffect(() => {
    if (!alterado) return;
    const avisar = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", avisar);
    return () => window.removeEventListener("beforeunload", avisar);
  }, [alterado]);

  function mudar() {
    setAlterado(true);
    setResultado(null);
  }

  function editarAtividade<K extends keyof Atividade>(campoAlterado: K, valor: Atividade[K]) {
    setAtividade((a) => ({ ...a, [campoAlterado]: valor }));
    mudar();
  }

  function editarExercicio(indice: number, novo: Exercicio) {
    setExercicios((lista) => lista.map((e, i) => (i === indice ? novo : e)));
    mudar();
  }

  function adicionarExercicio(tipo: TipoExercicio) {
    setExercicios((lista) => [...lista, novoExercicio(tipo)]);
    mudar();
  }

  function salvar(publicar = atividade.publicada) {
    const dados = { ...atual, publicada: publicar };
    iniciarSalvar(async () => {
      let r: ResultadoSalvar;
      try {
        r = await salvarAtividade({ atividade: dados, exercicios, turmas: turmasMarcadas });
      } catch {
        r = { ok: false, erro: "Sem conexão com o servidor. Suas alterações continuam aqui; tente salvar de novo." };
      }
      setResultado(r);
      if (r.ok) {
        setAtividade(dados);
        setPublicadaSalva(publicar);
        setAlterado(false);
      }
    });
  }

  const problemas = problemasDaAtividade(atividade.titulo, exercicios.map(limparExercicio));
  const linkPublico = `/atividades/${atividade.id}`;

  return (
    <div className="pb-28">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/professor/atividades" className="text-sm font-bold text-primaria hover:underline">
          ← Atividades
        </Link>
        <div className="flex rounded-full bg-suave p-1 text-sm font-bold" role="tablist">
          {(["editar", "ver"] as const).map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={modo === m}
              onClick={() => setModo(m)}
              className={`rounded-full px-4 py-1.5 transition-colors ${modo === m ? "bg-fundo text-tinta shadow-sm" : "text-tinta-suave"}`}
            >
              {m === "editar" ? "Editar" : "Ver como aluno"}
            </button>
          ))}
        </div>
      </div>

      {modo === "ver" ? (
        <div className="mt-6">
          <Previa atividade={atual} exercicios={exercicios.map(limparExercicio)} />
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <section className="space-y-4 rounded-2xl border border-linha p-5 sm:p-6">
            <div>
              <label htmlFor="titulo" className={rotulo}>
                Título
              </label>
              <input
                id="titulo"
                value={atividade.titulo}
                onChange={(e) => editarAtividade("titulo", e.target.value)}
                placeholder="Ex.: Hábitos no passado"
                className={`${campo} text-lg font-bold`}
              />
            </div>
            <fieldset>
              <legend className={rotulo}>O que esta atividade ensina</legend>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["idioma", "Um idioma"],
                    ["materia", "Outra matéria"],
                  ] as const
                ).map(([valor, texto]) => (
                  <button
                    key={valor}
                    type="button"
                    aria-pressed={tipo === valor}
                    onClick={() => {
                      setTipo(valor);
                      mudar();
                    }}
                    className={`rounded-full border-2 px-4 py-1.5 text-sm font-bold transition-colors ${tipo === valor ? "border-primaria bg-primaria-suave text-primaria" : "border-linha text-tinta-suave hover:border-tinta"}`}
                  >
                    {texto}
                  </button>
                ))}
              </div>
            </fieldset>
            {tipo === "idioma" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="nivel" className={rotulo}>
                    Nível
                  </label>
                  <select
                    id="nivel"
                    value={atividade.nivel}
                    onChange={(e) => editarAtividade("nivel", e.target.value as Nivel)}
                    className={campo}
                  >
                    {niveis.map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="categoria" className={rotulo}>
                    Tema
                  </label>
                  <select
                    id="categoria"
                    value={atividade.categoria}
                    onChange={(e) => editarAtividade("categoria", e.target.value as Categoria)}
                    className={campo}
                  >
                    {Object.entries(categorias).map(([valor, nome]) => (
                      <option key={valor} value={valor}>
                        {nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="idioma_ensinado" className={rotulo}>
                    Idioma ensinado
                  </label>
                  <select
                    id="idioma_ensinado"
                    value={atual.idioma_ensinado ?? "es"}
                    onChange={(e) => editarAtividade("idioma_ensinado", e.target.value)}
                    className={campo}
                  >
                    {Object.entries(idiomas).map(([codigo, nome]) => (
                      <option key={codigo} value={codigo}>
                        {nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="idioma_instrucao" className={rotulo}>
                    Idioma das explicações
                  </label>
                  <select
                    id="idioma_instrucao"
                    value={atual.idioma_instrucao ?? "pt"}
                    onChange={(e) => editarAtividade("idioma_instrucao", e.target.value)}
                    className={campo}
                  >
                    {Object.entries(idiomas).map(([codigo, nome]) => (
                      <option key={codigo} value={codigo}>
                        {nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor="materia" className={rotulo}>
                  Matéria
                </label>
                <input
                  id="materia"
                  value={atividade.materia}
                  onChange={(e) => editarAtividade("materia", e.target.value)}
                  list="sugestoes-materia"
                  maxLength={60}
                  placeholder="Ex.: Matemática"
                  className={campo}
                />
                <datalist id="sugestoes-materia">
                  {sugestoesMateria.map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
              </div>
            )}
            <div>
              <label htmlFor="explicacao" className={rotulo}>
                Explicação do conteúdo
              </label>
              <textarea
                id="explicacao"
                value={atividade.explicacao}
                onChange={(e) => editarAtividade("explicacao", e.target.value)}
                rows={4}
                placeholder="O aluno lê isto antes dos exercícios. Ex.: usamos o pretérito imperfeito para falar de hábitos no passado..."
                className={campo}
              />
            </div>
          </section>

          {exercicios.map((exercicio, i) => (
            <EditorExercicio
              key={exercicio.id}
              numero={i + 1}
              total={exercicios.length}
              exercicio={exercicio}
              onChange={(novo) => editarExercicio(i, novo)}
              onMover={(d) => {
                setExercicios((lista) => mover(lista, i, d));
                mudar();
              }}
              onRemover={() => {
                if (!confirm(`Apagar o exercício ${i + 1}?`)) return;
                setExercicios((lista) => lista.filter((_, j) => j !== i));
                mudar();
              }}
            />
          ))}

          <section className="rounded-2xl border-2 border-dashed border-linha p-5 text-center">
            <p className="font-bold">Adicionar exercício</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {(Object.entries(tiposExercicio) as [TipoExercicio, string][]).map(([tipo, nome]) => (
                <button key={tipo} type="button" onClick={() => adicionarExercicio(tipo)} className={botaoSecundario}>
                  + {nome}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-tinta-suave">Imagem, áudio e vídeo chegam na próxima etapa.</p>
          </section>

          <section className="space-y-4 rounded-2xl border border-linha p-5 sm:p-6">
            <h2 className="text-lg font-bold">Quem pode fazer</h2>
            <div>
              <span className={rotulo}>Turmas</span>
              {turmas.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {turmas.map((turma) => {
                    const marcada = turmasMarcadas.includes(turma.id);
                    return (
                      <label
                        key={turma.id}
                        className={`flex cursor-pointer items-center gap-2 rounded-full border-2 px-4 py-1.5 text-sm font-bold ${marcada ? "border-primaria bg-primaria-suave text-primaria" : "border-linha"}`}
                      >
                        <input
                          type="checkbox"
                          checked={marcada}
                          onChange={(e) => {
                            setTurmasMarcadas((t) => (e.target.checked ? [...t, turma.id] : t.filter((x) => x !== turma.id)));
                            mudar();
                          }}
                          className="sr-only"
                        />
                        {marcada ? "✓ " : ""}
                        {turma.nome}
                      </label>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-tinta-suave">
                  Você ainda não tem turmas. <Link href="/professor" className="font-bold text-primaria hover:underline">Criar turma</Link>
                </p>
              )}
              <p className="mt-2 text-xs text-tinta-suave">Os alunos das turmas marcadas veem a atividade e as respostas deles ficam salvas para você.</p>
            </div>
            <label className="flex items-start gap-2.5 rounded-xl bg-suave px-3.5 py-3 text-sm">
              <input
                type="checkbox"
                checked={atividade.publica}
                onChange={(e) => editarAtividade("publica", e.target.checked)}
                className={`${caixaMarcar} mt-0.5`}
              />
              <span>
                <strong className="font-bold">Pública.</strong>{" "}
                <span className="text-tinta-suave">Qualquer pessoa com o link pode fazer, sem login. As respostas de quem não é da turma não são salvas.</span>
              </span>
            </label>
            {publicadaSalva && atividade.publica && !alterado && (
              <p className="text-sm">
                Link: <Link href={linkPublico} className="font-bold break-all text-primaria hover:underline">repasa.com.br{linkPublico}</Link>
              </p>
            )}
          </section>

          <form
            action={apagarAtividade}
            onSubmit={(e) => {
              if (!confirm("Apagar esta atividade? As respostas dos alunos também serão apagadas.")) e.preventDefault();
            }}
            className="text-center"
          >
            <input type="hidden" name="id" value={atividade.id} />
            <button type="submit" className="text-sm font-bold text-erro hover:underline">
              Apagar atividade
            </button>
          </form>
        </div>
      )}

      <BarraSalvar
        publicada={publicadaSalva}
        alterado={alterado}
        salvando={salvando}
        resultado={resultado}
        problemas={problemas}
        onSalvar={() => salvar()}
        onPublicar={() => salvar(true)}
        onDespublicar={() => salvar(false)}
      />
    </div>
  );
}

function EditorExercicio({
  numero,
  total,
  exercicio,
  onChange,
  onMover,
  onRemover,
}: {
  numero: number;
  total: number;
  exercicio: Exercicio;
  onChange: (e: Exercicio) => void;
  onMover: (direcao: -1 | 1) => void;
  onRemover: () => void;
}) {
  function moverItem(i: number, d: -1 | 1) {
    onChange({ ...exercicio, itens: mover(exercicio.itens as never[], i, d) } as Exercicio);
  }
  function removerItem(i: number) {
    onChange({ ...exercicio, itens: exercicio.itens.filter((_, j) => j !== i) } as Exercicio);
  }

  return (
    <section className="rounded-2xl border border-linha p-5 sm:p-6">
      <header className="mb-4 flex items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primaria-suave text-sm font-extrabold text-primaria">
          {numero}
        </span>
        <span className="flex-1 text-sm font-bold text-tinta-suave">{tiposExercicio[exercicio.tipo]}</span>
        <button type="button" onClick={() => onMover(-1)} disabled={numero === 1} aria-label="Subir exercício" className={botaoIcone}>
          ↑
        </button>
        <button type="button" onClick={() => onMover(1)} disabled={numero === total} aria-label="Descer exercício" className={botaoIcone}>
          ↓
        </button>
        <button type="button" onClick={onRemover} aria-label="Apagar exercício" className={botaoIcone}>
          ✕
        </button>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={`titulo-${exercicio.id}`} className={rotulo}>
            Título do exercício
          </label>
          <input
            id={`titulo-${exercicio.id}`}
            value={exercicio.titulo}
            onChange={(e) => onChange({ ...exercicio, titulo: e.target.value })}
            className={campo}
          />
        </div>
        <div>
          <label htmlFor={`instrucoes-${exercicio.id}`} className={rotulo}>
            Instruções
          </label>
          <input
            id={`instrucoes-${exercicio.id}`}
            value={exercicio.instrucoes}
            onChange={(e) => onChange({ ...exercicio, instrucoes: e.target.value })}
            className={campo}
          />
        </div>
      </div>

      <EditorMidia
        midia={exercicio.midia}
        onChange={(midia) => {
          const { midia: _antiga, ...resto } = exercicio;
          void _antiga;
          onChange((midia ? { ...resto, midia } : resto) as Exercicio);
        }}
      />

      <ExtrasDoExercicio exercicio={exercicio} onChange={onChange} />

      <div className="mt-5 space-y-4">
        {exercicio.itens.map((item, i) => (
          <div key={item.id} className="rounded-xl border border-linha p-4">
            <CabecalhoItem
              numero={i + 1}
              total={exercicio.itens.length}
              rotulo={exercicio.tipo === "relacionar" ? "Par" : exercicio.tipo === "classificar" ? "Cartão" : "Item"}
              onMover={(d) => moverItem(i, d)}
              onRemover={() => removerItem(i)}
            />
            <EditorDoItem exercicio={exercicio} indice={i} onChange={onChange} />
          </div>
        ))}
      </div>

      <button type="button" onClick={() => onChange(comItemNovo(exercicio))} className={`${botaoSecundario} mt-4`}>
        {exercicio.tipo === "relacionar" ? "+ Par" : exercicio.tipo === "classificar" ? "+ Cartão" : "+ Item"}
      </button>
    </section>
  );
}

function comItemNovo(e: Exercicio): Exercicio {
  switch (e.tipo) {
    case "lacuna":
      return { ...e, itens: [...e.itens, novoItemLacuna()] };
    case "multipla_escolha":
      return { ...e, itens: [...e.itens, novoItemMultiplaEscolha()] };
    case "arrastar":
      return { ...e, itens: [...e.itens, novoItemArrastar()] };
    case "classificar":
      return { ...e, itens: [...e.itens, novoItemClassificar()] };
    case "relacionar":
      return { ...e, itens: [...e.itens, novoItemRelacionar()] };
  }
}

/** Troca o item na posição indicada, mantendo o tipo do exercício. */
function EditorDoItem({ exercicio, indice, onChange }: { exercicio: Exercicio; indice: number; onChange: (e: Exercicio) => void }) {
  switch (exercicio.tipo) {
    case "lacuna":
      return <EditorLacuna item={exercicio.itens[indice]} onChange={(novo) => onChange({ ...exercicio, itens: trocar(exercicio.itens, indice, novo) })} />;
    case "multipla_escolha":
      return <EditorMultipla item={exercicio.itens[indice]} onChange={(novo) => onChange({ ...exercicio, itens: trocar(exercicio.itens, indice, novo) })} />;
    case "arrastar":
      return <EditorArrastar item={exercicio.itens[indice]} onChange={(novo) => onChange({ ...exercicio, itens: trocar(exercicio.itens, indice, novo) })} />;
    case "classificar":
      return (
        <EditorClassificar
          item={exercicio.itens[indice]}
          colunas={exercicio.colunas}
          onChange={(novo) => onChange({ ...exercicio, itens: trocar(exercicio.itens, indice, novo) })}
        />
      );
    case "relacionar":
      return <EditorRelacionar item={exercicio.itens[indice]} onChange={(novo) => onChange({ ...exercicio, itens: trocar(exercicio.itens, indice, novo) })} />;
  }
}

/** Partes do exercício que não são itens: palavras extras do banco e colunas. */
function ExtrasDoExercicio({ exercicio, onChange }: { exercicio: Exercicio; onChange: (e: Exercicio) => void }) {
  if (exercicio.tipo === "arrastar") {
    return (
      <div className="mt-5">
        <ListaCurta
          rotuloTexto="Palavras extras no banco"
          dica="As palavras certas já entram no banco. Acrescente outras para o aluno ter que pensar (opcional)."
          valores={exercicio.palavrasExtras}
          onChange={(palavrasExtras) => onChange({ ...exercicio, palavrasExtras })}
          exemplo="Ex.: fue"
          textoAdicionar="+ Palavra extra"
        />
      </div>
    );
  }
  if (exercicio.tipo === "classificar") {
    return (
      <div className="mt-5 rounded-xl bg-suave p-4">
        <span className={rotulo}>Colunas</span>
        <div className="flex flex-wrap gap-2">
          {exercicio.colunas.map((coluna, i) => (
            <div key={coluna.id} className="flex items-center gap-1">
              <input
                value={coluna.nome}
                onChange={(e) => onChange({ ...exercicio, colunas: trocar(exercicio.colunas, i, { ...coluna, nome: e.target.value }) })}
                placeholder={i === 0 ? "Ex.: Ser" : "Ex.: Estar"}
                aria-label={`Nome da coluna ${i + 1}`}
                className="w-40 rounded-xl border-2 border-linha bg-fundo px-3 py-1.5 font-bold outline-none focus:border-primaria"
              />
              <button
                type="button"
                disabled={exercicio.colunas.length <= 2}
                onClick={() =>
                  onChange({
                    ...exercicio,
                    colunas: exercicio.colunas.filter((c) => c.id !== coluna.id),
                    itens: exercicio.itens.map((it) => (it.colunaId === coluna.id ? { ...it, colunaId: "" } : it)),
                  })
                }
                aria-label="Remover coluna"
                className={botaoIcone}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        {exercicio.colunas.length < 4 && (
          <button
            type="button"
            onClick={() => onChange({ ...exercicio, colunas: [...exercicio.colunas, { id: novoId(), nome: "" }] })}
            className={`${botaoTexto} mt-2`}
          >
            + Coluna
          </button>
        )}
      </div>
    );
  }
  return null;
}

function Previa({ atividade, exercicios }: { atividade: Atividade; exercicios: Exercicio[] }) {
  return (
    <div>
      <p className="mb-4 rounded-xl bg-aviso-fundo px-3.5 py-2.5 text-sm">
        Pré-visualização: é assim que o aluno vê. Nada do que você responder aqui é salvo.
      </p>
      <CabecalhoAtividade atividade={atividade} />
      <div className="mt-6">
        <AulaAtividade exercicios={exercicios} />
      </div>
    </div>
  );
}

function BarraSalvar({
  publicada,
  alterado,
  salvando,
  resultado,
  problemas,
  onSalvar,
  onPublicar,
  onDespublicar,
}: {
  publicada: boolean;
  alterado: boolean;
  salvando: boolean;
  resultado: ResultadoSalvar | null;
  problemas: string[];
  onSalvar: () => void;
  onPublicar: () => void;
  onDespublicar: () => void;
}) {
  const [verProblemas, setVerProblemas] = useState(false);
  const erro = resultado && !resultado.ok ? resultado : null;
  const listaProblemas = erro?.problemas ?? (verProblemas ? problemas : []);

  let estado = publicada ? "Publicada" : "Rascunho";
  if (salvando) estado = "Salvando...";
  else if (alterado) estado = "Alterações não salvas";
  else if (resultado?.ok) estado = publicada ? "Publicada e salva" : "Rascunho salvo";

  return (
    <div className="fixed inset-x-0 bottom-0 z-10 border-t border-linha bg-fundo/95 backdrop-blur">
      <div className="mx-auto max-w-3xl px-4 py-3">
        {erro && <p role="alert" className="mb-2 text-sm font-semibold text-erro">{erro.erro}</p>}
        {listaProblemas.length > 0 && (
          <ul className="mb-2 max-h-32 list-disc space-y-0.5 overflow-y-auto pl-5 text-sm text-tinta-suave">
            {listaProblemas.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className={`text-sm font-bold ${alterado ? "text-aviso" : "text-tinta-suave"}`}>
            {publicada && !alterado && !salvando ? "● " : ""}
            {estado}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {publicada ? (
              <button type="button" onClick={onDespublicar} disabled={salvando} className={botaoSecundario}>
                Voltar a rascunho
              </button>
            ) : (
              <button type="button" onClick={onSalvar} disabled={salvando || !alterado} className={botaoSecundario}>
                Salvar rascunho
              </button>
            )}
            {publicada ? (
              <button type="button" onClick={onSalvar} disabled={salvando || !alterado} className={botaoPrimario}>
                Salvar
              </button>
            ) : (
              <button
                type="button"
                onClick={problemas.length > 0 ? () => setVerProblemas(true) : onPublicar}
                disabled={salvando}
                className={botaoPrimario}
              >
                Publicar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
