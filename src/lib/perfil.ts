import "server-only";
import { redirect } from "next/navigation";
import { supabaseConfigurado } from "./supabase/config";
import { criarClienteServidor } from "./supabase/servidor";

export type Papel = "professora" | "aluno";

export type Perfil = {
  id: string;
  nome: string | null;
  email: string;
  papel: Papel;
};

/** Perfil de quem está logado, ou null. */
export async function obterPerfil(): Promise<Perfil | null> {
  if (!supabaseConfigurado) return null;

  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("perfil").select("id, nome, email, papel").eq("id", user.id).single();
  return data;
}

export function paginaInicial(papel: Papel) {
  return papel === "professora" ? "/professora" : "/aluno";
}

/** Para páginas restritas: manda para o login ou para a área certa. */
export async function exigirPapel(papel: Papel): Promise<Perfil> {
  const perfil = await obterPerfil();
  if (!perfil) redirect("/entrar");
  if (perfil.papel !== papel) redirect(paginaInicial(perfil.papel));
  return perfil;
}
