"use server";

import { revalidatePath } from "next/cache";
import type { EstadoFormulario } from "@/components/ui/Mensagem";
import { exigirPapel } from "@/lib/perfil";
import { criarClienteAdmin } from "@/lib/supabase/admin";

export async function convidarAluno(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  await exigirPapel("professora");

  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!nome || !email) return { erro: "Preencha nome e e-mail do aluno." };

  // O link do e-mail aponta para /auth/confirmar (modelo "Invite user" configurado no Supabase).
  const { error } = await criarClienteAdmin().auth.admin.inviteUserByEmail(email, { data: { nome } });

  if (error) {
    if (error.message.toLowerCase().includes("already")) return { erro: "Esse e-mail já tem conta na plataforma." };
    return { erro: `Não foi possível enviar o convite: ${error.message}` };
  }

  revalidatePath("/professora");
  return { sucesso: `Convite enviado para ${email}.` };
}
