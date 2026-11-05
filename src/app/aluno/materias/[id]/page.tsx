import Link from "next/link";
import { notFound } from "next/navigation";
import { Cabecalho } from "@/components/Cabecalho";
import { BotaoExcluir } from "@/components/BotaoExcluir";
import { botaoPrimario } from "@/components/ui/estilos";
import { cores, type Cor } from "@/lib/mapas";
import { temMapa } from "@/lib/pedidos";
import { exigirPapel } from "@/lib/perfil";
import { camposResumo, tituloResumo, type Resumo } from "@/lib/resumos";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { apagarMateria, apagarResumoAluno } from "../actions";
import { SeletorCurso, type CursoSimples } from "../SeletorCurso";

const formatoData = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short" });

/** Data curta ("5 de nov."); vazia se a data vier faltando ou estranha, em vez de quebrar a página. */
function dataCurta(valor: string | null | undefined) {
  const d = valor ? new Date(valor) : null;
  return d && !Number.isNaN(d.getTime()) ? formatoData.format(d) : "";
}

export default async function PaginaMateria({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ver?: string }>;
}) {
  const [{ id }, { ver }] = await Promise.all([params, searchParams]);
  const soMapas = ver === "mapas";
  await exigirPapel("aluno");
  const supabase = await criarClienteServidor();
  const [{ data: materia }, { data: resumosDb }, { data: cursosDb }] = await Promise.all([
    supabase.from("materia").select("id, nome, cor, curso_id").eq("id", id).maybeSingle(),
    supabase.from("resumo").select(camposResumo).eq("materia_id", id).order("atualizado_em", { ascending: false }),
    supabase.from("curso").select("id, nome").order("nome"),
  ]);
  const cursos = (cursosDb ?? []) as CursoSimples[];
  if (!materia) notFound();
  const todos = ((resumosDb ?? []) as Resumo[]).filter((r) => r && r.id);
  const comMapa = todos.filter(temMapa);
  const resumos = soMapas ? comMapa : todos;
  const cor = cores[typeof materia.cor === "string" && materia.cor in cores ? (materia.cor as Cor) : "menta"];

  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-7xl px-4 pt-8 pb-16 sm:px-6 lg:px-8">
        <Link
          href={`/aluno/cursos/${(materia.curso_id as string | null) ?? "sem-curso"}`}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-primaria hover:underline"
        >
          <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 5l-7 7 7 7" />
          </svg>
          {cursos.find((c) => c.id === materia.curso_id)?.nome ?? "Sem curso"}
        </Link>
        <h1 className="mt-3 flex items-center gap-3 text-3xl font-extrabold tracking-tight">
          <span aria-hidden className="size-4 rounded-full" style={{ background: cor.traco }} />
          {materia.nome}
        </h1>
        <p className="mt-2 text-tinta-suave">Seus resumos e mapas mentais desta matéria. Só você vê.</p>
        {cursos.length > 0 && (
          <div className="mt-3">
            <SeletorCurso materiaId={materia.id} cursoId={(materia.curso_id as string | null) ?? null} cursos={cursos} />
          </div>
        )}

        <Link href={`/aluno/materias/${materia.id}/resumos/novo`} className={`${botaoPrimario} mt-6 inline-block`}>
          Novo resumo ou mapa mental
        </Link>

        {todos.length > 0 && (
          <nav aria-label="Mostrar" className="mt-6 flex gap-2">
            {[
              { href: `/aluno/materias/${materia.id}`, rotulo: `Resumos (${todos.length})`, ativo: !soMapas },
              { href: `/aluno/materias/${materia.id}?ver=mapas`, rotulo: `Mapas mentais (${comMapa.length})`, ativo: soMapas },
            ].map((aba) => (
              <Link
                key={aba.href}
                href={aba.href}
                aria-current={aba.ativo ? "page" : undefined}
                className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
                  aba.ativo ? "bg-tinta text-fundo" : "border border-linha text-tinta-suave hover:border-tinta hover:text-tinta"
                }`}
              >
                {aba.rotulo}
              </Link>
            ))}
          </nav>
        )}

        {resumos.length > 0 ? (
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {resumos.map((r) => (
              <li key={r.id} className="flex flex-col rounded-2xl border border-linha transition-colors hover:border-primaria">
                <Link href={`/aluno/resumos/${r.id}`} className="block grow p-5 pb-3">
                  <span className="block font-bold">{tituloResumo(r)}</span>
                  <span className="mt-1 block text-sm text-tinta-suave">
                    {temMapa(r) ? "Com mapa mental" : "Resumo"}
                    {dataCurta(r.atualizado_em) && ` · ${dataCurta(r.atualizado_em)}`}
                  </span>
                </Link>
                <div className="flex items-baseline gap-4 px-5 pb-4">
                  <Link
                    href={`/aluno/materias/${materia.id}/resumos/${r.id}`}
                    className="text-sm font-bold text-primaria underline-offset-4 hover:underline"
                  >
                    Editar
                  </Link>
                  <BotaoExcluir
                    acao={apagarResumoAluno}
                    campos={{ id: r.id, materia_id: materia.id }}
                    pergunta={`Excluir "${tituloResumo(r)}"? Não dá para desfazer.`}
                    discreto
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 rounded-2xl border border-dashed border-linha p-5 text-sm text-tinta-suave">
            {soMapas
              ? "Nenhum mapa mental nesta matéria ainda. Abra um resumo e gere o mapa dele, ou crie um novo."
              : "Nenhum resumo ainda. Comece com um mapa mental do último assunto que você estudou."}
          </p>
        )}

        <BotaoExcluir
          acao={apagarMateria}
          campos={{ id: materia.id }}
          rotulo="Excluir matéria e seus resumos"
          pergunta={`Excluir a matéria "${materia.nome}" e todos os resumos dela? Não dá para desfazer.`}
          className="mt-10 border-t border-linha pt-6"
        />
      </main>
    </>
  );
}
