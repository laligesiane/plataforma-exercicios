import Link from "next/link";
import { AssinarAgenda } from "@/components/AssinarAgenda";
import { Cabecalho } from "@/components/Cabecalho";
import { descreverTurma } from "@/lib/turmas";
import { exigirPapel } from "@/lib/perfil";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { FormularioTurma } from "./FormularioTurma";

export default async function PainelProfessor() {
  const perfil = await exigirPapel("professor");
  const supabase = await criarClienteServidor();

  const [{ data: plano }, { data: turmas }] = await Promise.all([
    supabase.from("plano").select("nome, max_turmas, max_alunos_por_turma, max_atividades_por_turma").eq("id", perfil.plano_id).single(),
    supabase
      .from("turma")
      .select("id, nome, materia, idioma_ensinado, idioma_instrucao, turma_aluno(count)")
      .order("criada_em"),
  ]);

  const totalTurmas = turmas?.length ?? 0;
  const podeCriar = plano ? totalTurmas < plano.max_turmas : false;

  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-3xl px-4 pt-8 pb-16">
        <h1 className="text-3xl font-extrabold tracking-tight">Olá{perfil.nome ? `, ${perfil.nome}` : ""}!</h1>
        {plano && (
          <p className="mt-2 text-tinta-suave">
            Plano <strong className="text-tinta">{plano.nome}</strong>:{" "}
            <span className="tabular-nums">
              {totalTurmas} de {plano.max_turmas} {plano.max_turmas === 1 ? "turma" : "turmas"}
            </span>
            , até {plano.max_alunos_por_turma} alunos e {plano.max_atividades_por_turma} atividades por turma.
          </p>
        )}

        <Link
          href="/professor/atividades"
          className="mt-6 flex items-center justify-between gap-4 rounded-2xl bg-primaria-suave p-5 transition-opacity hover:opacity-90"
        >
          <span>
            <span className="block font-bold text-primaria">Atividades</span>
            <span className="mt-0.5 block text-sm">Crie aulas com explicação e exercícios corrigidos na hora.</span>
          </span>
          <span aria-hidden className="text-xl font-bold text-primaria">→</span>
        </Link>

        <div className="mt-4">
          <AssinarAgenda perfilId={perfil.id} />
        </div>

        <section className="mt-8 space-y-3">
          <h2 className="text-lg font-bold">Suas turmas</h2>
          {turmas && turmas.length > 0 ? (
            <ul className="grid gap-3 sm:grid-cols-2">
              {turmas.map((turma) => (
                <li key={turma.id}>
                  <Link
                    href={`/professor/turmas/${turma.id}`}
                    className="block rounded-2xl border border-linha p-5 transition-colors hover:border-primaria"
                  >
                    <span className="block font-bold">{turma.nome}</span>
                    <span className="mt-1 block text-sm text-tinta-suave">
                      {descreverTurma(turma)}
                    </span>
                    <span className="mt-3 inline-block rounded-full bg-primaria-suave px-3 py-1 text-xs font-bold text-primaria tabular-nums">
                      {turma.turma_aluno[0]?.count ?? 0} alunos
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-tinta-suave">Você ainda não tem turmas. Crie a primeira abaixo.</p>
          )}
        </section>

        <section className="mt-8 rounded-2xl border border-linha p-5 sm:p-6">
          <h2 className="mb-4 text-lg font-bold">Nova turma</h2>
          {podeCriar ? (
            <FormularioTurma />
          ) : (
            <p className="rounded-xl bg-suave px-3.5 py-2.5 text-sm text-tinta-suave">
              Você já usa todas as turmas do plano {plano?.nome}. Planos com mais turmas chegam em breve.
            </p>
          )}
        </section>
      </main>
    </>
  );
}
