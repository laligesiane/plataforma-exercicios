import Link from "next/link";
import { Cabecalho } from "@/components/Cabecalho";
import { nomeIdioma } from "@/lib/idiomas";
import { exigirPapel } from "@/lib/perfil";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export default async function AreaAluno() {
  const perfil = await exigirPapel("aluno");
  const supabase = await criarClienteServidor();
  const { data: turmas } = await supabase.from("turma").select("id, nome, idioma_ensinado, idioma_instrucao").order("nome");

  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-3xl px-4 pt-8 pb-16">
        <h1 className="text-3xl font-extrabold tracking-tight">Olá{perfil.nome ? `, ${perfil.nome}` : ""}!</h1>
        <p className="mt-2 text-tinta-suave">As atividades das suas turmas vão aparecer aqui.</p>

        {turmas && turmas.length > 0 && (
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {turmas.map((turma) => (
              <li key={turma.id} className="rounded-2xl border border-linha p-5">
                <span className="block font-bold">{turma.nome}</span>
                <span className="mt-1 block text-sm text-tinta-suave">
                  {nomeIdioma(turma.idioma_ensinado)} explicado em {nomeIdioma(turma.idioma_instrucao).toLowerCase()}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 rounded-2xl border border-dashed border-linha p-6 text-center">
          <p className="font-semibold">Nenhuma atividade publicada ainda.</p>
          <Link href="/" className="mt-3 inline-block text-sm font-bold text-primaria hover:underline">
            Experimentar a aula de demonstração
          </Link>
        </div>
      </main>
    </>
  );
}
