"use server";

import { headers } from "next/headers";
import type { EstadoFormulario } from "@/components/ui/Mensagem";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export async function cadastrarProfessor(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const senha = String(formData.get("senha") ?? "");
  if (!nome || !email) return { erro: "Preencha nome e e-mail." };
  if (senha.length < 8) return { erro: "A senha precisa ter pelo menos 8 caracteres." };

  const origem = (await headers()).get("origin") ?? "";
  const supabase = await criarClienteServidor();
  const { error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: { data: { nome, papel: "professor" }, emailRedirectTo: `${origem}/auth/confirmar?next=/professor` },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already")) return { erro: "Esse e-mail já tem conta. Use Entrar." };
    return { erro: `Não foi possível criar a conta: ${error.message}` };
  }

  return { sucesso: `Quase lá! Enviamos um link de confirmação para ${email}.` };
}
