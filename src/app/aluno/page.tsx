import Link from "next/link";
import { Cabecalho } from "@/components/Cabecalho";
import { exigirPapel } from "@/lib/perfil";

export default async function AreaAluno() {
  const perfil = await exigirPapel("aluno");

  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-3xl px-4 pt-8 pb-16">
        <h1 className="text-3xl font-extrabold tracking-tight">Olá{perfil.nome ? `, ${perfil.nome}` : ""}!</h1>
        <p className="mt-2 text-tinta-suave">As atividades da sua professora vão aparecer aqui.</p>
        <div className="mt-8 rounded-2xl border border-dashed border-linha p-6 text-center">
          <p className="font-semibold">Nenhuma atividade publicada ainda.</p>
          <Link href="/" className="mt-3 inline-block text-sm font-bold text-primaria hover:underline">
            Experimentar a aula de demonstração
          </Link>
        </div>
      </main>
    </>
  );
}
