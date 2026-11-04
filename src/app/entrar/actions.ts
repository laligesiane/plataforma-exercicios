"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { EstadoFormulario } from "@/components/ui/Mensagem";
import { destinoDepoisDoLogin } from "@/lib/auth/depois-do-login";
import { caminhoInterno } from "@/lib/auth/destino";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export type EstadoCodigo = (EstadoFormulario & { enviadoPara?: string }) | null;

export async function entrar(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");
  if (!email || !senha) return { erro: "Preencha e-mail e senha." };

  const supabase = await criarClienteServidor();
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (error) return { erro: "E-mail ou senha incorretos. Se você entra pelo Google ou nunca criou senha, use “Receber código por e-mail”." };

  redirect(await destinoDepoisDoLogin(String(formData.get("proximo") ?? "")));
}

/** Passo 1 do login sem senha: manda um código de 6 dígitos para o e-mail. */
export async function enviarCodigo(_estado: EstadoCodigo, formData: FormData): Promise<EstadoCodigo> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { erro: "Digite seu e-mail." };

  const supabase = await criarClienteServidor();
  const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
  if (error) {
    if (error.code === "over_email_send_rate_limit" || error.status === 429) {
      return { erro: "Espere um minuto antes de pedir outro código." };
    }
    if (error.code === "otp_disabled" || error.message.toLowerCase().includes("signups not allowed")) {
      return { erro: "Não achamos uma conta com esse e-mail. Confira o endereço ou crie sua conta grátis." };
    }
    return { erro: `Não foi possível enviar o código: ${error.message}` };
  }
  return { enviadoPara: email, sucesso: `Enviamos um código para ${email}. Ele vale por 1 hora.` };
}

/** Passo 2 do login sem senha: confere o código digitado. */
export async function verificarCodigo(_estado: EstadoCodigo, formData: FormData): Promise<EstadoCodigo> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const codigo = String(formData.get("codigo") ?? "").replace(/\D/g, "");
  if (codigo.length < 6) return { enviadoPara: email, erro: "Digite o código que chegou no e-mail." };

  const supabase = await criarClienteServidor();
  const { error } = await supabase.auth.verifyOtp({ email, token: codigo, type: "email" });
  if (error) return { enviadoPara: email, erro: "Código errado ou vencido. Confira o último e-mail ou peça outro código." };

  redirect(await destinoDepoisDoLogin(String(formData.get("proximo") ?? "")));
}

/** Entrar (ou criar conta) com o Google. Quem é novo escolhe professor ou aluno em /bem-vindo. */
export async function entrarComGoogle(formData: FormData) {
  const origem = (await headers()).get("origin") ?? "";
  const proximo = caminhoInterno(String(formData.get("proximo") ?? ""));
  const volta = `${origem}/auth/confirmar?next=${encodeURIComponent(proximo ? `/entrar?proximo=${encodeURIComponent(proximo)}` : "/entrar")}`;

  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: volta, queryParams: { prompt: "select_account" } },
  });
  if (error || !data.url) redirect("/entrar?erro=google");
  redirect(data.url);
}

export async function sair() {
  const supabase = await criarClienteServidor();
  await supabase.auth.signOut();
  redirect("/");
}
