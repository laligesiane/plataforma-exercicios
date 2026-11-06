import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BotaoGoogle, Divisor } from "@/components/auth/BotaoGoogle";
import { Cabecalho } from "@/components/Cabecalho";
import { obterPerfil, paginaInicial } from "@/lib/perfil";
import { loginGoogleLigado, supabaseConfigurado } from "@/lib/supabase/config";
import { ComLinks } from "@/components/ui/ComLinks";
import { obterDicionario, obterIdioma } from "@/i18n/servidor";
import { FormularioCadastro } from "./FormularioCadastro";

export async function generateMetadata(): Promise<Metadata> {
  const d = await obterDicionario();
  return { title: d.cadastro.tituloPagina, description: d.cadastro.descricaoPagina, alternates: { canonical: "/cadastro" } };
}

export default async function PaginaCadastro({ searchParams }: { searchParams: Promise<{ papel?: string }> }) {
  const papel = (await searchParams).papel === "aluno" ? "aluno" : "professor";
  const perfil = await obterPerfil();
  if (perfil) redirect(perfil.papel_escolhido ? paginaInicial(perfil.papel) : "/bem-vindo");
  const [d, idioma] = await Promise.all([obterDicionario(), obterIdioma()]);

  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-sm px-4 pt-12 pb-16">
        <div role="tablist" aria-label={d.cadastro.tipoConta} className="mb-6 grid grid-cols-2 gap-1 rounded-full bg-suave p-1">
          {(
            [
              ["professor", d.cadastro.souProfessor],
              ["aluno", d.cadastro.souAluno],
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
          {papel === "aluno" ? d.cadastro.contaAluno : d.cadastro.contaProfessor}
        </h1>
        <p className="mt-2 mb-6 text-tinta-suave">
          {papel === "aluno"
            ? d.cadastro.textoAluno
            : d.cadastro.textoProfessor}
        </p>
        {supabaseConfigurado ? (
          <>
            {loginGoogleLigado && (
              <>
                <BotaoGoogle />
                <p className="mt-2 text-center text-xs text-tinta-suave">
                  <ComLinks
                    texto={d.auth.aceiteGoogle}
                    links={{ termos: ["/termos", d.auth.termos], privacidade: ["/privacidade", d.auth.privacidade] }}
                  />
                </p>
                <Divisor />
              </>
            )}
            <FormularioCadastro papel={papel} idioma={idioma} />
          </>
        ) : (
          <p className="rounded-xl bg-aviso-fundo px-3.5 py-2.5 text-sm text-aviso">{d.cadastro.naoConfigurado}</p>
        )}
        <p className="mt-6 text-center text-sm text-tinta-suave">
          {d.cadastro.jaTemConta}{" "}
          <Link href="/entrar" className="font-bold text-primaria hover:underline">
            {d.cadastro.entrar}
          </Link>
        </p>
      </main>
    </>
  );
}
