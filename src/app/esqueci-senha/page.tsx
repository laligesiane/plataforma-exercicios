import Link from "next/link";
import { Cabecalho } from "@/components/Cabecalho";
import { supabaseConfigurado } from "@/lib/supabase/config";
import { FormularioEsqueci } from "./FormularioEsqueci";

export default function PaginaEsqueciSenha() {
  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-sm px-4 pt-12 pb-16">
        <h1 className="text-3xl font-extrabold tracking-tight">Esqueci minha senha</h1>
        <p className="mt-2 mb-6 text-tinta-suave">Digite o e-mail da sua conta. Vamos mandar um link para você criar uma nova senha.</p>
        {supabaseConfigurado ? (
          <FormularioEsqueci />
        ) : (
          <p className="rounded-xl bg-aviso-fundo px-3.5 py-2.5 text-sm text-aviso">O login ainda não foi configurado.</p>
        )}
        <p className="mt-6 text-center text-sm text-tinta-suave">
          Lembrou?{" "}
          <Link href="/entrar" className="font-bold text-primaria hover:underline">
            Voltar para Entrar
          </Link>
        </p>
      </main>
    </>
  );
}
