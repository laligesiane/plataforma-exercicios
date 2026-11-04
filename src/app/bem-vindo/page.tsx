import { redirect } from "next/navigation";
import { Cabecalho } from "@/components/Cabecalho";
import { obterPerfil, paginaInicial } from "@/lib/perfil";
import { escolherPapel } from "./actions";

const opcoes = [
  {
    papel: "professor",
    titulo: "Sou professor",
    texto: "Crio turmas, registro as aulas, monto atividades e convido meus alunos.",
  },
  {
    papel: "aluno",
    titulo: "Sou aluno",
    texto: "Organizo minhas matérias e resumos e faço as atividades dos meus professores.",
  },
] as const;

export default async function PaginaBemVindo({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  const perfil = await obterPerfil();
  if (!perfil) redirect("/entrar");
  if (perfil.papel_escolhido) redirect(paginaInicial(perfil.papel));

  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-md px-4 pt-12 pb-16">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Boas-vindas{perfil.nome ? `, ${perfil.nome.split(" ")[0]}` : ""}!
        </h1>
        <p className="mt-2 mb-6 text-tinta-suave">Falta só uma coisa: como você vai usar a Repasa?</p>
        {erro && (
          <p role="alert" className="mb-4 rounded-xl bg-erro-fundo px-3.5 py-2.5 text-sm text-erro">
            Não foi possível salvar. Tente de novo.
          </p>
        )}
        <form action={escolherPapel} className="grid gap-3">
          {opcoes.map((o) => (
            <button
              key={o.papel}
              name="papel"
              value={o.papel}
              className="rounded-2xl border-2 border-linha bg-fundo p-5 text-left transition-colors hover:border-primaria focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
            >
              <span className="block text-lg font-extrabold">{o.titulo}</span>
              <span className="mt-1 block text-sm text-tinta-suave">{o.texto}</span>
            </button>
          ))}
        </form>
        <p className="mt-4 text-sm text-tinta-suave">Essa escolha não muda depois, então escolha com calma.</p>
      </main>
    </>
  );
}
