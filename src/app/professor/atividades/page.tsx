import Link from "next/link";
import { Cabecalho } from "@/components/Cabecalho";
import { categorias, type Categoria } from "@/lib/atividades/modelo";
import { nomeIdioma } from "@/lib/idiomas";
import { exigirPapel } from "@/lib/perfil";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { BotaoNovaAtividade } from "./novo-botao";

export default async function AtividadesProfessor({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  const professor = await exigirPapel("professor");
  const supabase = await criarClienteServidor();
  const { data: atividades, error } = await supabase
    .from("atividade")
    .select("id, titulo, nivel, categoria, idioma_ensinado, publicada, publica, exercicio(count), atividade_turma(turma(nome))")
    .eq("professor_id", professor.id)
    .order("atualizada_em", { ascending: false });

  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-3xl px-4 pt-8 pb-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-extrabold tracking-tight">Atividades</h1>
          <BotaoNovaAtividade />
        </div>

        {error ? (
          <p role="alert" className="mt-8 rounded-xl bg-aviso-fundo px-3.5 py-2.5 text-sm text-aviso">
            O banco ainda não tem as tabelas de atividades. No Supabase, abra o SQL Editor e rode o arquivo{" "}
            <code className="font-bold">supabase/migrations/0002_atividades.sql</code>.
          </p>
        ) : erro === "criar" ? (
          <p role="alert" className="mt-8 rounded-xl bg-erro-fundo px-3.5 py-2.5 text-sm text-erro">
            Não foi possível criar a atividade. Tente de novo em instantes.
          </p>
        ) : null}

        {atividades && atividades.length > 0 ? (
          <ul className="mt-8 space-y-3">
            {atividades.map((a) => {
              const turmas = a.atividade_turma.flatMap((t) => {
                const turma = t.turma as unknown as { nome: string } | null;
                return turma ? [turma.nome] : [];
              });
              const total = a.exercicio[0]?.count ?? 0;
              return (
                <li key={a.id} className="rounded-2xl border border-linha p-5 transition-colors hover:border-primaria">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <Link href={`/professor/atividades/${a.id}`} className="min-w-0 flex-1">
                      <span className="block font-bold">{a.titulo}</span>
                      <span className="mt-1 block text-sm text-tinta-suave">
                        {a.nivel} · {categorias[a.categoria as Categoria] ?? a.categoria} · {nomeIdioma(a.idioma_ensinado)} ·{" "}
                        {total} {total === 1 ? "exercício" : "exercícios"}
                      </span>
                    </Link>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${a.publicada ? "bg-certo-fundo text-certo" : "bg-suave text-tinta-suave"}`}
                    >
                      {a.publicada ? (a.publica ? "Publicada · pública" : "Publicada") : "Rascunho"}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    <span className="text-tinta-suave">{turmas.length > 0 ? turmas.join(", ") : "Sem turma"}</span>
                    <Link href={`/professor/atividades/${a.id}`} className="font-bold text-primaria hover:underline">
                      Editar
                    </Link>
                    {a.publicada && (
                      <Link href={`/professor/atividades/${a.id}/respostas`} className="font-bold text-primaria hover:underline">
                        Respostas dos alunos
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-8 rounded-2xl border-2 border-dashed border-linha p-8 text-center">
            <p className="font-bold">Nenhuma atividade ainda.</p>
            <p className="mt-1 text-sm text-tinta-suave">
              Crie uma aula com explicação e exercícios. Para cada erro previsto, você escreve o porquê, e o aluno vê na hora.
            </p>
          </div>
        )}
      </main>
    </>
  );
}
