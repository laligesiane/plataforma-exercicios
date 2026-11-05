import Link from "next/link";
import { redirect } from "next/navigation";
import { BotaoGoogle, Divisor } from "@/components/auth/BotaoGoogle";
import { Cabecalho } from "@/components/Cabecalho";
import { destinoDepoisDoLogin } from "@/lib/auth/depois-do-login";
import { caminhoInterno } from "@/lib/auth/destino";
import { obterPerfil } from "@/lib/perfil";
import { loginGoogleLigado, supabaseConfigurado } from "@/lib/supabase/config";
import { FormularioEntrar } from "./FormularioEntrar";

export default async function PaginaEntrar({ searchParams }: { searchParams: Promise<{ erro?: string; proximo?: string }> }) {
  const { erro, proximo: proximoBruto } = await searchParams;
  const proximo = caminhoInterno(proximoBruto) ?? undefined;
  if (await obterPerfil()) redirect(await destinoDepoisDoLogin(proximo));

  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-sm px-4 pt-12 pb-16">
        <h1 className="text-3xl font-extrabold tracking-tight">Entrar</h1>
        <p className="mt-2 mb-6 text-tinta-suave">
          Para alunos e professores. Depois de entrar, a Repasa abre a sua área.
        </p>
        {erro === "link" && (
          <p role="alert" className="mb-4 rounded-xl bg-erro-fundo px-3.5 py-2.5 text-sm text-erro">
            Esse link expirou ou já foi usado. Se era a confirmação do cadastro, tente entrar: a conta pode já estar confirmada. Se não der, faça o cadastro de novo com o mesmo e-mail para receber outro link. Se era um convite, peça um novo ao professor. Se era para trocar a senha, use “Esqueci minha senha”.
          </p>
        )}
        {erro === "google" && (
          <p role="alert" className="mb-4 rounded-xl bg-erro-fundo px-3.5 py-2.5 text-sm text-erro">
            Não deu para entrar com o Google. Tente de novo, ou entre com e-mail.
          </p>
        )}
        {supabaseConfigurado ? (
          <>
            {loginGoogleLigado && (
              <>
                <BotaoGoogle proximo={proximo} />
                <Divisor />
              </>
            )}
            <FormularioEntrar proximo={proximo} />
          </>
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
