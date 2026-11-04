"use server";

import { redirect } from "next/navigation";
import type { EstadoFormulario } from "@/components/ui/Mensagem";
import { obterPerfil, paginaInicial } from "@/lib/perfil";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export async function entrar(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");
  if (!email || !senha) return { erro: "Preencha e-mail e senha." };

  const supabase = await criarClienteServidor();
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (error) return { erro: "E-mail ou senha incorretos." };

  const perfil = await obterPerfil();
  const proximo = String(formData.get("proximo") ?? "");
  // Só caminhos internos, para o link não levar a outro site.
  if (/^\/(?![/\\])/.test(proximo)) redirect(proximo);
  redirect(perfil ? paginaInicial(perfil.papel) : "/");
}

export async function sair() {
  const supabase = await criarClienteServidor();
  await supabase.auth.signOut();
  redirect("/");
}
