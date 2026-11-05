import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BotaoGoogle, Divisor } from "@/components/auth/BotaoGoogle";
import { Cabecalho } from "@/components/Cabecalho";
import { obterPerfil, paginaInicial } from "@/lib/perfil";
import { loginGoogleLigado, supabaseConfigurado } from "@/lib/supabase/config";
import { FormularioCadastro } from "./FormularioCadastro";

export const metadata: Metadata = {
  title: "Criar conta grátis · Repasa",
  description: "Crie sua conta grátis na Repasa, como aluno ou professor. Resumos, mapas mentais e exercícios que explicam cada erro, sem anúncios.",
  alternates: { canonical: "/cadastro" },
};

export default async function PaginaCadastro({ searchParams }: { searchParams: Promise<{ papel?: string }> }) {
  const papel = (await searchParams).papel === "aluno" ? "aluno" : "professor";
  const perfil = await obterPerfil();
  if (perfil) redirect(perfil.papel_escolhido ? paginaInicial(perfil.papel) : "/bem-vindo");

  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-sm px-4 pt-12 pb-16">
        <div role="tablist" aria-label="Tipo de conta" className="mb-6 grid grid-cols-2 gap-1 rounded-full bg-suave p-1">
          {(
            [
              ["professor", "Sou professor"],
              ["aluno", "Sou aluno"],
            ] as const
          ).map(([valor, texto]) => (
            <Link
              key={valor}
              href={valor === "aluno" ? "/cadastro?papel=aluno" : "/cadastro"}
              role="tab"
              aria-selected={papel === valor}
              className={`rounded-full px-4 py-2 text-center text-sm font-bold transition-colors ${papel === valor ? "bg-fundo text-tinta shadow-sm" : "text-tinta-suave hover:text-tinta"}`}
            >
              {texto}
            </Link>
          ))}
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          {papel === "aluno" ? "Conta de aluno" : "Conta de professor"}
        </h1>
        <p className="mt-2 mb-6 text-tinta-suave">
          {papel === "aluno"
            ? "Organize seus estudos por matéria, com resumos e mapas mentais. Não precisa de professor: se um professor te convidar depois, as turmas dele aparecem aqui também."
            : "Crie turmas de qualquer matéria, registre as aulas, monte exercícios com explicação de cada erro e convide seus alunos."}
        </p>
        {supabaseConfigurado ? (
          <>
            {loginGoogleLigado && (
              <>
                <BotaoGoogle />
                <Divisor />
              </>
            )}
            <FormularioCadastro papel={papel} />
          </>
        ) : (
          <p className="rounded-xl bg-aviso-fundo px-3.5 py-2.5 text-sm text-aviso">O cadastro ainda não foi configurado.</p>
        )}
        <p className="mt-6 text-center text-sm text-tinta-suave">
          Já tem conta?{" "}
          <Link href="/entrar" className="font-bold text-primaria hover:underline">
            Entrar
          </Link>
        </p>
      </main>
    </>
  );
}
