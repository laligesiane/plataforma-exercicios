import Link from "next/link";
import { notFound } from "next/navigation";
import { Cabecalho } from "@/components/Cabecalho";
import { VerResumo } from "@/components/VerResumo";
import { AcoesResumo } from "@/components/AcoesResumo";
import { botaoPrimario } from "@/components/ui/estilos";
import { documentoTemConteudo } from "@/lib/documento";
import { validarMapa } from "@/lib/mapas";
import { apagarResumoAluno, gerarMapaDoResumo } from "@/app/aluno/materias/actions";
import { formatarData, tituloAula } from "@/lib/aulas";
import { iaConfigurada } from "@/lib/pratica/gerar";
import { exigirPapel } from "@/lib/perfil";
import { camposResumo, documentoDoResumo, type Resumo } from "@/lib/resumos";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export default async function ResumoDoAluno({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await exigirPapel("aluno");
  const supabase = await criarClienteServidor();
  const [{ data }, { data: praticas }] = await Promise.all([
    supabase
      .from("resumo")
      .select(`${camposResumo}, materia_id, turma(nome), aula(data, titulo), materia(id, nome)`)
      .eq("id", id)
      .maybeSingle(),
    supabase.from("pratica").select("id, titulo").eq("resumo_id", id).order("criada_em", { ascending: false }),
  ]);
  if (!data) notFound();

  const turma = data.turma as unknown as { nome: string } | null;
  const aula = data.aula as unknown as { data: string; titulo: string } | null;
  const materia = data.materia as unknown as { id: string; nome: string } | null;
  const subtitulo = [materia?.nome, turma?.nome, aula && (aula.titulo.trim() ? `${aula.titulo} · ${formatarData(aula.data)}` : tituloAula(aula))].filter(Boolean).join(" · ");

  const temTexto = documentoTemConteudo(documentoDoResumo(data as unknown as Resumo));
  const mapa = validarMapa(data.mapa);
  const temMapa = !!mapa && (!!mapa.centro || mapa.ramos.length > 0);

  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-5xl px-4 pt-8 pb-16">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={materia ? `/aluno/materias/${materia.id}` : "/aluno/materias#das-turmas"}
            className="inline-flex min-w-0 items-center gap-1.5 text-sm font-bold text-tinta-suave hover:text-primaria"
          >
            <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
            <span className="truncate">{materia ? materia.nome : "Resumos das turmas"}</span>
          </Link>
          <AcoesResumo
            id={data.id}
            materiaId={materia?.id ?? null}
            temTexto={temTexto}
            temMapa={temMapa}
            gerarMapa={materia ? gerarMapaDoResumo.bind(null, data.id) : undefined}
            excluir={materia ? apagarResumoAluno : undefined}
          />
        </div>
        <div className="mt-5">
          <VerResumo resumo={data as unknown as Resumo} subtitulo={subtitulo} />
        </div>

        {temTexto && iaConfigurada() && (
          <section className="esconder-no-foco mt-10 rounded-2xl bg-primaria-suave p-5 sm:p-6">
            <h2 className="text-lg font-bold">Treinar com este resumo</h2>
            <p className="mt-1 text-sm text-tinta-suave">
              Gere exercícios de lacuna, múltipla escolha, arrastar, classificar ou relacionar com base no que está escrito aqui.
            </p>
            <Link href={`/aluno/resumos/${data.id}/praticar`} className={`${botaoPrimario} mt-4 inline-block`}>
              Gerar atividade
            </Link>
            {(praticas ?? []).length > 0 && (
              <ul className="mt-5 space-y-2">
                {(praticas ?? []).map((p) => (
                  <li key={p.id}>
                    <Link href={`/aluno/praticas/${p.id}`} className="font-bold text-primaria hover:underline">
                      {p.titulo}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </main>
    </>
  );
}
