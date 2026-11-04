"use server";

import { headers } from "next/headers";
import type { EstadoFormulario } from "@/components/ui/Mensagem";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export async function cadastrar(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const senha = String(formData.get("senha") ?? "");
  const papel = formData.get("papel") === "aluno" ? "aluno" : "professor";
  if (!nome || !email) return { erro: "Preencha nome e e-mail." };
  if (senha.length < 8) return { erro: "A senha precisa ter pelo menos 8 caracteres." };

  const origem = (await headers()).get("origin") ?? "";
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: { data: { nome, papel }, emailRedirectTo: `${origem}/auth/confirmar?next=/${papel}` },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already")) return { erro: "Esse e-mail já tem conta. Use Entrar." };
    return { erro: `Não foi possível criar a conta: ${error.message}` };
  }

  // Quando o e-mail já tem conta, o Supabase responde "ok" sem enviar nada e devolve o usuário sem identidades.
  if (data.user && data.user.identities?.length === 0) {
    return { erro: "Esse e-mail já tem conta na Repasa. Use Entrar, ou “Esqueci minha senha” se não lembrar a senha." };
  }

  return { sucesso: `Quase lá! Enviamos um link de confirmação para ${email}.` };
}
