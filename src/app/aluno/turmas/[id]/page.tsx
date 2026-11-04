import Link from "next/link";
import { notFound } from "next/navigation";
import { Cabecalho } from "@/components/Cabecalho";
import { CartaoAula } from "@/components/CartaoAula";
import { camposAula, hojeNoFuso, type Aula } from "@/lib/aulas";
import { camposResumo, tituloResumo, type Resumo } from "@/lib/resumos";
import { exigirPapel } from "@/lib/perfil";
import { criarClienteServidor } from "@/lib/supabase/servidor";

/** Histórico de aulas de uma turma, para o aluno revisar. */
export default async function AulasDaTurma({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await exigirPapel("aluno");
  const supabase = await criarClienteServidor();

  const [{ data: turma }, { data: aulasDb }, { data: resumosDb }] = await Promise.all([
    supabase.from("turma").select("id, nome").eq("id", id).maybeSingle(),
    supabase.from("aula").select(camposAula).eq("turma_id", id).order("data", { ascending: false }),
    supabase.from("resumo").select(camposResumo).eq("turma_id", id),
  ]);
  const resumos = (resumosDb ?? []) as Resumo[];
  if (!turma) notFound();

  const hoje = hojeNoFuso();
  const aulas = ((aulasDb ?? []) as Aula[]).filter((a) => a.data <= hoje);

  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-3xl px-4 pt-8 pb-16">
        <Link href="/aluno/atividades" className="text-sm font-bold text-primaria hover:underline">
          ← Minhas atividades
        </Link>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight">{turma.nome}</h1>
        <p className="mt-2 text-tinta-suave">Todas as aulas, da mais recente para a mais antiga.</p>
        {aulas.length > 0 ? (
          <div className="mt-6 space-y-4">
            {aulas.map((a, i) => (
              <CartaoAula
                key={a.id}
                aula={a}
                destaque={i === 0 ? "Última aula" : undefined}
                resumos={resumos
                  .filter((r) => r.aula_id === a.id)
                  .map((r) => ({ id: r.id, titulo: tituloResumo(r), href: `/aluno/resumos/${r.id}` }))}
              />
            ))}
          </div>
        ) : (
          <p className="mt-6 rounded-2xl border border-dashed border-linha p-5 text-sm text-tinta-suave">
            O professor ainda não registrou nenhuma aula.
          </p>
        )}
      </main>
    </>
  );
}
