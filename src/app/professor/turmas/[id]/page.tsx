import Link from "next/link";
import { notFound } from "next/navigation";
import { Cabecalho } from "@/components/Cabecalho";
import { nomeIdioma } from "@/lib/idiomas";
import { exigirPapel } from "@/lib/perfil";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { FormularioConvite } from "./FormularioConvite";

type Aluno = { id: string; nome: string | null; email: string };

export default async function PaginaTurma({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const perfil = await exigirPapel("professor");
  const supabase = await criarClienteServidor();

  const [{ data: turma }, { data: plano }] = await Promise.all([
    supabase
      .from("turma")
      .select("id, nome, idioma_ensinado, idioma_instrucao, turma_aluno(perfil(id, nome, email))")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("plano").select("max_alunos_por_turma").eq("id", perfil.plano_id).single(),
  ]);
  if (!turma) notFound();

  // Relação muitos-para-um: o Supabase devolve um objeto, mas sem tipos gerados o cliente a tipa como lista.
  const alunos = turma.turma_aluno.flatMap((m) => (m.perfil ? [m.perfil as unknown as Aluno] : []));
  const limite = plano?.max_alunos_por_turma ?? 0;
  const cheia = alunos.length >= limite;

  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-3xl px-4 pt-8 pb-16">
        <Link href="/professor" className="text-sm font-bold text-primaria hover:underline">
          ← Minhas turmas
        </Link>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight">{turma.nome}</h1>
        <p className="mt-2 text-tinta-suave">
          {nomeIdioma(turma.idioma_ensinado)} explicado em {nomeIdioma(turma.idioma_instrucao).toLowerCase()}
        </p>

        <section className="mt-8 rounded-2xl border border-linha p-5 sm:p-6">
          <h2 className="mb-4 text-lg font-bold">Convidar aluno</h2>
          {cheia ? (
            <p className="rounded-xl bg-suave px-3.5 py-2.5 text-sm text-tinta-suave">
              A turma chegou ao limite de {limite} alunos do seu plano.
            </p>
          ) : (
            <FormularioConvite turmaId={turma.id} />
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-linha p-5 sm:p-6">
          <h2 className="text-lg font-bold">
            Alunos{" "}
            <span className="font-semibold text-tinta-suave tabular-nums">
              ({alunos.length} de {limite})
            </span>
          </h2>
          {alunos.length > 0 ? (
            <ul className="mt-3 divide-y divide-linha">
              {alunos.map((aluno) => (
                <li key={aluno.id} className="flex flex-wrap items-baseline justify-between gap-x-4 py-3">
                  <span className="font-semibold">{aluno.nome ?? "Sem nome"}</span>
                  <span className="min-w-0 text-sm break-all text-tinta-suave">{aluno.email}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-tinta-suave">Nenhum aluno ainda. Os convidados aparecem aqui.</p>
          )}
        </section>
      </main>
    </>
  );
}
