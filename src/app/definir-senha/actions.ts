"use server";

import { redirect } from "next/navigation";
import type { EstadoFormulario } from "@/components/ui/Mensagem";
import { obterPerfil, paginaInicial } from "@/lib/perfil";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export async function definirSenha(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const senha = String(formData.get("senha") ?? "");
  const confirmacao = String(formData.get("confirmacao") ?? "");
  if (senha.length < 8) return { erro: "A senha precisa ter pelo menos 8 caracteres." };
  if (senha !== confirmacao) return { erro: "As duas senhas não são iguais." };

  const supabase = await criarClienteServidor();
  const { error } = await supabase.auth.updateUser({ password: senha });
  if (error) return { erro: "Não foi possível salvar a senha. Abra o link do e-mail de novo." };

  const perfil = await obterPerfil();
  redirect(perfil ? paginaInicial(perfil.papel) : "/");
}
