import "server-only";
import { redirect } from "next/navigation";
import { supabaseConfigurado } from "./supabase/config";
import { criarClienteServidor } from "./supabase/servidor";

export type Papel = "professor" | "aluno";

export type Perfil = {
  id: string;
  nome: string | null;
  email: string;
  papel: Papel;
  plano_id: string;
  criado_em: string;
  /** false só para quem entrou pela primeira vez com o Google e ainda não disse se é professor ou aluno. */
  papel_escolhido: boolean;
  /** Cor da Repasa escolhida no perfil (0031); sem a coluna, fica o verde menta. */
  tema?: string;
  /** Caminho da foto no bucket "avatar" (0038); null sem foto. */
  foto?: string | null;
};

/** Perfil de quem está logado, ou null. */
export async function obterPerfil(): Promise<Perfil | null> {
  if (!supabaseConfigurado) return null;

  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // "*" para não quebrar se a coluna papel_escolhido (0019) ainda não existir.
  const { data } = await supabase.from("perfil").select("*").eq("id", user.id).single();
  if (!data) return null;
  return { ...data, papel_escolhido: data.papel_escolhido !== false } as Perfil;
}

export function paginaInicial(papel: Papel) {
  return papel === "professor" ? "/professor" : "/aluno";
}

/** Para páginas restritas: manda para o login ou para a área certa. */
export async function exigirPapel(papel: Papel): Promise<Perfil> {
  const perfil = await obterPerfil();
  if (!perfil) redirect("/entrar");
  if (!perfil.papel_escolhido) redirect("/bem-vindo");
  if (perfil.papel !== papel) redirect(paginaInicial(perfil.papel));
  return perfil;
}

/** Para páginas de qualquer pessoa logada. */
export async function exigirLogin(): Promise<Perfil> {
  const perfil = await obterPerfil();
  if (!perfil) redirect("/entrar?proximo=/perfil");
  return perfil;
}
