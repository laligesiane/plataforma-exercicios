"use server";

import { headers } from "next/headers";
import type { EstadoFormulario } from "@/components/ui/Mensagem";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { fmt } from "@/i18n/config";
import { obterDicionario } from "@/i18n/servidor";

export async function pedirNovaSenha(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const d = await obterDicionario();
  if (!email) return { erro: d.esqueci.erroDigiteEmail };

  const origem = (await headers()).get("origin") ?? "";
  const supabase = await criarClienteServidor();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origem}/auth/confirmar?next=/definir-senha`,
  });

  if (error?.status === 429) return { erro: d.esqueci.erroMuitos };

  // A mesma resposta para qualquer e-mail, para não revelar quem tem conta.
  return { sucesso: fmt(d.esqueci.sucesso, { email }) };
}
