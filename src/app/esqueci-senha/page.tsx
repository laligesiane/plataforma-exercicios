import Link from "next/link";
import { Cabecalho } from "@/components/Cabecalho";
import { supabaseConfigurado } from "@/lib/supabase/config";
import { obterDicionario } from "@/i18n/servidor";
import { FormularioEsqueci } from "./FormularioEsqueci";

export default async function PaginaEsqueciSenha() {
  const d = await obterDicionario();
  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-sm px-4 pt-12 pb-16">
        <h1 className="text-3xl font-extrabold tracking-tight">{d.esqueci.titulo}</h1>
        <p className="mt-2 mb-6 text-tinta-suave">{d.esqueci.subtitulo}</p>
        {supabaseConfigurado ? (
          <FormularioEsqueci />
        ) : (
          <p className="rounded-xl bg-aviso-fundo px-3.5 py-2.5 text-sm text-aviso">{d.auth.loginNaoConfigurado}</p>
        )}
        <p className="mt-6 text-center text-sm text-tinta-suave">
          {d.esqueci.lembrou}{" "}
          <Link href="/entrar" className="font-bold text-primaria hover:underline">
            {d.esqueci.voltar}
          </Link>
        </p>
      </main>
    </>
  );
}
