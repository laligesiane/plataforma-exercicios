import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BotaoGoogle, Divisor } from "@/components/auth/BotaoGoogle";
import { Cabecalho } from "@/components/Cabecalho";
import { destinoDepoisDoLogin } from "@/lib/auth/depois-do-login";
import { caminhoInterno } from "@/lib/auth/destino";
import { obterPerfil } from "@/lib/perfil";
import { loginGoogleLigado, supabaseConfigurado } from "@/lib/supabase/config";
import { ComLinks } from "@/components/ui/ComLinks";
import { obterDicionario } from "@/i18n/servidor";
import { FormularioEntrar } from "./FormularioEntrar";

export async function generateMetadata(): Promise<Metadata> {
  const d = await obterDicionario();
  return { title: d.entrar.tituloPagina, description: d.entrar.descricaoPagina, alternates: { canonical: "/entrar" } };
}

export default async function PaginaEntrar({ searchParams }: { searchParams: Promise<{ erro?: string; proximo?: string }> }) {
  const { erro, proximo: proximoBruto } = await searchParams;
  const proximo = caminhoInterno(proximoBruto) ?? undefined;
  if (await obterPerfil()) redirect(await destinoDepoisDoLogin(proximo));
  const d = await obterDicionario();

  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-sm px-4 pt-12 pb-16">
        <h1 className="text-3xl font-extrabold tracking-tight">{d.entrar.titulo}</h1>
        <p className="mt-2 mb-6 text-tinta-suave">
          {d.entrar.subtitulo}
        </p>
        {erro === "link" && (
          <p role="alert" className="mb-4 rounded-xl bg-erro-fundo px-3.5 py-2.5 text-sm text-erro">
            {d.entrar.erroLink}
          </p>
        )}
        {erro === "google" && (
          <p role="alert" className="mb-4 rounded-xl bg-erro-fundo px-3.5 py-2.5 text-sm text-erro">
            {d.entrar.erroGoogle}
          </p>
        )}
        {supabaseConfigurado ? (
          <>
            {loginGoogleLigado && (
              <>
                <BotaoGoogle proximo={proximo} />
                <p className="mt-2 text-center text-xs text-tinta-suave">
                  <ComLinks
                    texto={d.auth.aceiteGoogle}
                    links={{ termos: ["/termos", d.auth.termos], privacidade: ["/privacidade", d.auth.privacidade] }}
                  />
                </p>
                <Divisor />
              </>
            )}
            <FormularioEntrar proximo={proximo} />
          </>
        ) : (
          <p className="rounded-xl bg-aviso-fundo px-3.5 py-2.5 text-sm text-aviso">{d.auth.loginNaoConfigurado}</p>
        )}
        <p className="mt-6 text-center text-sm text-tinta-suave">
          {d.entrar.semConta}{" "}
          <Link href="/cadastro" className="font-bold text-primaria hover:underline">
            {d.entrar.criarGratis}
          </Link>
        </p>
      </main>
    </>
  );
}
