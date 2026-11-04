import { Cabecalho } from "@/components/Cabecalho";
import { exigirPapel } from "@/lib/perfil";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { FormularioConvite } from "./FormularioConvite";

export default async function PainelProfessora() {
  const perfil = await exigirPapel("professora");
  const supabase = await criarClienteServidor();
  const { data: alunos } = await supabase
    .from("perfil")
    .select("id, nome, email, criado_em")
    .eq("papel", "aluno")
    .order("nome");

  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-3xl px-4 pt-8 pb-16">
        <h1 className="text-3xl font-extrabold tracking-tight">Olá{perfil.nome ? `, ${perfil.nome}` : ""}!</h1>
        <p className="mt-2 text-tinta-suave">Convide seus alunos. Cada um recebe um e-mail para criar a senha.</p>

        <section className="mt-8 rounded-2xl border border-linha p-5 sm:p-6">
          <h2 className="mb-4 text-lg font-bold">Convidar aluno</h2>
          <FormularioConvite />
        </section>

        <section className="mt-6 rounded-2xl border border-linha p-5 sm:p-6">
          <h2 className="text-lg font-bold">
            Alunos <span className="font-semibold text-tinta-suave tabular-nums">({alunos?.length ?? 0})</span>
          </h2>
          {alunos && alunos.length > 0 ? (
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
