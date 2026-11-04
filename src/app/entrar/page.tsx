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
        <p className="mt-2 mb-6 text-tinta-suave">Que bom ver você de novo.</p>
        {erro === "link" && (
          <p role="alert" className="mb-4 rounded-xl bg-erro-fundo px-3.5 py-2.5 text-sm text-erro">
            Esse link expirou ou já foi usado. Se era um convite, peça um novo ao professor. Se era para trocar a senha, peça outro link em “Esqueci minha senha”.
          </p>
        )}
        {supabaseConfigurado ? (
          <FormularioEntrar proximo={proximo} />
        ) : (
          <p className="rounded-xl bg-aviso-fundo px-3.5 py-2.5 text-sm text-aviso">O login ainda não foi configurado.</p>
        )}
        <p className="mt-6 text-center text-sm text-tinta-suave">
          Ainda não tem conta?{" "}
          <Link href="/cadastro" className="font-bold text-primaria hover:underline">
            Crie sua conta grátis
          </Link>
        </p>
      </main>
    </>
  );
}
