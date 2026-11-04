import Link from "next/link";
import { redirect } from "next/navigation";
import { Cabecalho } from "@/components/Cabecalho";
import { obterPerfil, paginaInicial } from "@/lib/perfil";
import { supabaseConfigurado } from "@/lib/supabase/config";
import { FormularioEntrar } from "./FormularioEntrar";

export default async function PaginaEntrar({ searchParams }: { searchParams: Promise<{ erro?: string; proximo?: string }> }) {
  const { erro, proximo } = await searchParams;
  const perfil = await obterPerfil();
  if (perfil) redirect(proximo?.match(/^\/(?![/\\])/) ? proximo : paginaInicial(perfil.papel));

  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-sm px-4 pt-12 pb-16">
        <h1 className="text-3xl font-extrabold tracking-tight">Entrar</h1>
        <p className="mt-2 mb-6 text-tinta-suave">Alunos entram pelo convite do professor.</p>
        {erro === "link" && (
          <p role="alert" className="mb-4 rounded-xl bg-erro-fundo px-3.5 py-2.5 text-sm text-erro">
            Esse link de convite expirou ou já foi usado. Peça um novo ao professor.
          </p>
        )}
        {supabaseConfigurado ? (
          <FormularioEntrar proximo={proximo} />
        ) : (
          <p className="rounded-xl bg-aviso-fundo px-3.5 py-2.5 text-sm text-aviso">O login ainda não foi configurado.</p>
        )}
        <p className="mt-6 text-center text-sm text-tinta-suave">
          É professor?{" "}
          <Link href="/cadastro" className="font-bold text-primaria hover:underline">
            Crie sua conta grátis
          </Link>
        </p>
      </main>
    </>
  );
}
