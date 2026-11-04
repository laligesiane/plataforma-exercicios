import Link from "next/link";
import { redirect } from "next/navigation";
import { Cabecalho } from "@/components/Cabecalho";
import { obterPerfil, paginaInicial } from "@/lib/perfil";
import { supabaseConfigurado } from "@/lib/supabase/config";
import { FormularioCadastro } from "./FormularioCadastro";

export default async function PaginaCadastro() {
  const perfil = await obterPerfil();
  if (perfil) redirect(paginaInicial(perfil.papel));

  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-sm px-4 pt-12 pb-16">
        <h1 className="text-3xl font-extrabold tracking-tight">Conta de professor</h1>
        <p className="mt-2 mb-6 text-tinta-suave">
          Crie turmas, monte exercícios com explicação de cada erro e convide seus alunos. O plano grátis inclui 1 turma
          com até 10 alunos.
        </p>
        {supabaseConfigurado ? (
          <FormularioCadastro />
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
