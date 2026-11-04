import { redirect } from "next/navigation";
import { Cabecalho } from "@/components/Cabecalho";
import { botaoTexto } from "@/components/ui/estilos";
import { destinoDepoisDoLogin } from "@/lib/auth/depois-do-login";
import { caminhoInterno } from "@/lib/auth/destino";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { sair } from "../actions";
import { FormularioVerificar } from "./FormularioVerificar";

export default async function PaginaVerificar({ searchParams }: { searchParams: Promise<{ proximo?: string }> }) {
  const proximo = caminhoInterno((await searchParams).proximo) ?? undefined;
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");
  const { data: nivel } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (!(nivel?.currentLevel === "aal1" && nivel.nextLevel === "aal2")) redirect(await destinoDepoisDoLogin(proximo));

  return (
    <>
      <Cabecalho semMenu />
      <main className="mx-auto w-full max-w-sm px-4 pt-12 pb-16">
        <h1 className="text-3xl font-extrabold tracking-tight">Verificação em duas etapas</h1>
        <p className="mt-2 mb-6 text-tinta-suave">
          Abra o app autenticador do celular (Google Authenticator, Microsoft Authenticator, 1Password...) e digite o código
          da Repasa.
        </p>
        <FormularioVerificar proximo={proximo} />
        <form action={sair} className="mt-6 text-center">
          <button className={botaoTexto}>Sair e entrar com outra conta</button>
        </form>
        <p className="mt-6 text-sm text-tinta-suave">
          Perdeu o celular ou apagou o app? Fale com a equipe da Repasa usando o e-mail da sua conta para desligar a verificação.
        </p>
      </main>
    </>
  );
}
