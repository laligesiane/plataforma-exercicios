import { LANG_HTML } from "@/i18n/config";
import { obterDicionario, obterIdioma } from "@/i18n/servidor";
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
import { idiomaNaMateria } from "@/lib/idiomas";
import { iaConfigurada } from "@/lib/pratica/gerar";
import { exigirPapel } from "@/lib/perfil";
import { camposResumo, documentoDoResumo, type Resumo } from "@/lib/resumos";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export default async function ResumoDoAluno({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await exigirPapel("aluno");
  const [d, idioma] = await Promise.all([obterDicionario(), obterIdioma()]);
  const tx = d.resumo;
  const locale = LANG_HTML[idioma];
  const supabase = await criarClienteServidor();
  const [{ data }, { data: praticas }] = await Promise.all([
    supabase
      .from("resumo")
      .select(`${camposResumo}, materia_id, turma(nome, materia, idioma_ensinado), aula(data, titulo), materia(id, nome, curso(nome))`)
      .eq("id", id)
      .maybeSingle(),
    supabase.from("pratica").select("id, titulo").eq("resumo_id", id).order("criada_em", { ascending: false }),
  ]);
  if (!data) notFound();

  const turma = data.turma as unknown as { nome: string; materia: string | null; idioma_ensinado: string | null } | null;
  const aula = data.aula as unknown as { data: string; titulo: string } | null;
  const materia = data.materia as unknown as { id: string; nome: string; curso: { nome: string } | null } | null;
  // Resumo de um curso de idioma: a turma de idioma, ou a matéria/curso com nome de idioma ("Espanhol").
  const idiomaDoCurso =
    (turma && !turma.materia?.trim() ? turma.idioma_ensinado : null) ??
    (turma?.materia ? idiomaNaMateria(turma.materia) : null) ??
    (materia ? (idiomaNaMateria(materia.nome) ?? (materia.curso ? idiomaNaMateria(materia.curso.nome) : null)) : null);
  const subtitulo = [materia?.nome, turma?.nome, aula && (aula.titulo.trim() ? `${aula.titulo} · ${formatarData(aula.data, locale)}` : tituloAula(aula, d.datas, locale))].filter(Boolean).join(" · ");

  const temTexto = documentoTemConteudo(documentoDoResumo(data as unknown as Resumo));
  const mapa = validarMapa(data.mapa);
  const temMapa = !!mapa && (!!mapa.centro || mapa.ramos.length > 0);

  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-7xl px-4 pt-8 pb-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={materia ? `/aluno/materias/${materia.id}` : "/aluno/materias#das-turmas"}
            className="inline-flex min-w-0 items-center gap-1.5 text-sm font-bold text-tinta-suave hover:text-primaria"
          >
            <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
            <span className="truncate">{materia ? materia.nome : tx.dasTurmas}</span>
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
          <VerResumo resumo={data as unknown as Resumo} subtitulo={subtitulo} idiomaDoCurso={idiomaDoCurso} />
        </div>

        {temTexto && iaConfigurada() && (
          <section className="esconder-no-foco mt-10 rounded-2xl bg-primaria-suave p-5 sm:p-6">
            <h2 className="text-lg font-bold">{tx.treinar}</h2>
            <p className="mt-1 text-sm text-tinta-suave">
              {tx.treinarTexto}
            </p>
            <Link href={`/aluno/resumos/${data.id}/praticar`} className={`${botaoPrimario} mt-4 inline-block`}>
              {tx.gerarAtividade}
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
