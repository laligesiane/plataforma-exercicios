import { redirect } from "next/navigation";
import { Cabecalho } from "@/components/Cabecalho";
import { obterPerfil } from "@/lib/perfil";
import { FormularioSenha } from "./FormularioSenha";

export default async function PaginaDefinirSenha() {
  const perfil = await obterPerfil();
  if (!perfil) redirect("/entrar");

  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-sm px-4 pt-12 pb-16">
        <h1 className="text-3xl font-extrabold tracking-tight">Crie sua senha</h1>
        <p className="mt-2 mb-6 text-tinta-suave">
          {perfil.nome ? `Olá, ${perfil.nome}! ` : ""}Escolha a senha que você vai usar para entrar.
        </p>
        <FormularioSenha />
      </main>
    </>
  );
}
