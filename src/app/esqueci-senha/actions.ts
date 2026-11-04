"use server";

import { headers } from "next/headers";
import type { EstadoFormulario } from "@/components/ui/Mensagem";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export async function pedirNovaSenha(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { erro: "Digite seu e-mail." };

  const origem = (await headers()).get("origin") ?? "";
  const supabase = await criarClienteServidor();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origem}/auth/confirmar?next=/definir-senha`,
  });

  if (error?.status === 429) return { erro: "Muitos pedidos seguidos. Espere alguns minutos e tente de novo." };

  // A mesma resposta para qualquer e-mail, para não revelar quem tem conta.
  return { sucesso: `Se ${email} tiver conta na Repasa, enviamos um link para criar uma nova senha. Confira também o spam.` };
}
