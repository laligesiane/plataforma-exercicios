"use server";

import { redirect } from "next/navigation";
import type { EstadoFormulario } from "@/components/ui/Mensagem";
import { destinoDepoisDoLogin } from "@/lib/auth/depois-do-login";
import { criarClienteServidor } from "@/lib/supabase/servidor";

/** Segunda etapa do login: código de 6 dígitos do app autenticador. */
export async function verificarSegundaEtapa(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const codigo = String(formData.get("codigo") ?? "").replace(/\D/g, "");
  if (codigo.length !== 6) return { erro: "Digite os 6 números que aparecem no app." };

  const supabase = await criarClienteServidor();
  const { data: fatores } = await supabase.auth.mfa.listFactors();
  const fator = fatores?.totp[0];
  if (!fator) redirect("/entrar");

  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: fator.id, code: codigo });
  if (error) return { erro: "Código errado. Confira se o relógio do celular está certo e use o código que está aparecendo agora." };

  redirect(await destinoDepoisDoLogin(String(formData.get("proximo") ?? "")));
}
