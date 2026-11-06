import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Cabecalho } from "@/components/Cabecalho";
import { VerResumo } from "@/components/VerResumo";
import { Icone } from "@/components/jogos/Icones";
import { ehUuid } from "@/lib/atividades/modelo";
import { linkBibliotecaResumos } from "@/lib/atividades/biblioteca";
import { nomeIdioma } from "@/lib/idiomas";
import { obterPerfil } from "@/lib/perfil";
import { camposResumo, tituloResumo, type Resumo } from "@/lib/resumos";
import { criarClienteServidor } from "@/lib/supabase/servidor";

type Params = { params: Promise<{ id: string }> };
type Linha = Resumo & { autor_id: string; materia: string; idioma_ensinado: string | null };

async function carregar(id: string): Promise<Linha | null> {
  if (!ehUuid(id)) return null;
  const supabase = await criarClienteServidor();
  // As regras do banco decidem: público para todos, de turma só para quem é da turma, rascunho só para o professor.
  const { data } = await supabase
    .from("resumo")
    .select(`${camposResumo}, autor_id, materia, idioma_ensinado`)
    .eq("id", id)
    .not("turma_id", "is", null)
    .maybeSingle();
  return (data as unknown as Linha) ?? null;
}

function sobreDoResumo(r: Pick<Linha, "materia" | "idioma_ensinado">) {
  return r.materia?.trim() || (r.idioma_ensinado ? nomeIdioma(r.idioma_ensinado) : "");
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const r = await carregar(id);
  if (!r) return { title: "Repasa", robots: { index: false } };
  const sobre = sobreDoResumo(r);
  return {
    title: `${tituloResumo(r)} · Repasa`,
    description: `Resumo${sobre ? ` de ${sobre}` : ""} feito por um professor na Repasa. Grátis e sem anúncios.`,
    alternates: { canonical: `/resumos/${id}` },
    // Só resumo público e publicado entra no Google.
    robots: r.publico && r.publicado !== false ? undefined : { index: false, follow: false },
  };
}

export default async function PaginaResumo({ params }: Params) {
  const { id } = await params;
  if (!ehUuid(id)) notFound();
  const [perfil, r] = await Promise.all([obterPerfil(), carregar(id)]);
  if (!r) {
    // Sem login, um resumo de turma não aparece: manda entrar antes de dizer que não existe.
    if (!perfil) redirect(`/entrar?proximo=/resumos/${id}`);
    notFound();
  }

  const ehDono = perfil?.id === r.autor_id;
  const sobre = sobreDoResumo(r);
  const temas = r.temas ?? [];

  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-7xl px-4 pt-8 pb-16 sm:px-6 lg:px-8">
        {ehDono && (
          <p className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-suave px-3.5 py-2.5 text-sm">
            <span>
              {r.publicado === false
                ? "Rascunho: só você vê esta página."
                : r.publico
                  ? "Público: é assim que qualquer pessoa vê o seu resumo."
                  : "Só os alunos da turma veem este resumo."}
            </span>
            <Link href={`/professor/turmas/${r.turma_id}/resumos/${r.id}`} className="font-bold text-primaria hover:underline">
              Editar
            </Link>
          </p>
        )}
        {r.publico && (
          <Link
            href={linkBibliotecaResumos({})}
            className="esconder-no-foco mb-5 inline-flex items-center gap-1.5 text-sm font-bold text-tinta-suave hover:text-primaria"
          >
            <Icone nome="globo" className="size-4" />
            Biblioteca de resumos
          </Link>
        )}

        <VerResumo resumo={r} subtitulo={sobre} idiomaDoCurso={r.idioma_ensinado} />

        {temas.length > 0 && (
          <ul className="mt-8 flex flex-wrap gap-1.5" aria-label="Temas">
            {temas.map((t) => (
              <li key={t}>
                <Link
                  href={linkBibliotecaResumos({ tema: t })}
                  className="inline-block rounded-full bg-suave px-2.5 py-0.5 text-xs font-bold text-tinta-suave hover:text-primaria"
                >
                  {t}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {perfil?.papel === "aluno" && (
          <section className="esconder-no-foco mt-10 rounded-2xl bg-primaria-suave p-5 sm:p-6">
            <h2 className="text-lg font-bold">Estudar com este resumo</h2>
            <p className="mt-1 text-sm text-tinta-suave">Abra na sua área para ouvir, jogar e treinar com exercícios.</p>
            <Link href={`/aluno/resumos/${r.id}`} className="mt-3 inline-block font-bold text-primaria hover:underline">
              Abrir na minha área
            </Link>
          </section>
        )}
        {!perfil && (
          <p className="mt-10 text-sm text-tinta-suave">
            Na Repasa você também pode escrever seus resumos, gerar mapas mentais e treinar com jogos.{" "}
            <Link href="/cadastro" className="font-bold text-primaria hover:underline">
              Criar conta grátis
            </Link>
          </p>
        )}
      </main>
    </>
  );
}
