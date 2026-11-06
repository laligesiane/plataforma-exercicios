"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import type { EstadoFormulario } from "@/components/ui/Mensagem";
import { marcarEvento } from "@/lib/analytics/servidor";
import { destinoDepoisDoLogin } from "@/lib/auth/depois-do-login";
import { caminhoInterno } from "@/lib/auth/destino";
import { fmt } from "@/i18n/config";
import { obterDicionario } from "@/i18n/servidor";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export type EstadoCodigo = (EstadoFormulario & { enviadoPara?: string }) | null;

export async function entrar(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");
  const d = await obterDicionario();
  if (!email || !senha) return { erro: d.entrar.erroPreencha };

  const supabase = await criarClienteServidor();
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (error) return { erro: d.entrar.erroSenha };

  await marcarEvento("login", { method: "senha" });
  redirect(await destinoDepoisDoLogin(String(formData.get("proximo") ?? "")));
}

/** Passo 1 do login sem senha: manda um código de 6 dígitos para o e-mail. */
export async function enviarCodigo(_estado: EstadoCodigo, formData: FormData): Promise<EstadoCodigo> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const d = await obterDicionario();
  if (!email) return { erro: d.entrar.erroDigiteEmail };

  const supabase = await criarClienteServidor();
  const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
  if (error) {
    if (error.code === "over_email_send_rate_limit" || error.status === 429) {
      return { erro: d.entrar.erroEspere };
    }
    if (error.code === "otp_disabled" || error.message.toLowerCase().includes("signups not allowed")) {
      return { erro: d.entrar.erroSemConta };
    }
    return { erro: fmt(d.entrar.erroEnviar, { erro: error.message }) };
  }
  return { enviadoPara: email, sucesso: fmt(d.entrar.codigoEnviado, { email }) };
}

/** Passo 2 do login sem senha: confere o código digitado. */
export async function verificarCodigo(_estado: EstadoCodigo, formData: FormData): Promise<EstadoCodigo> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const codigo = String(formData.get("codigo") ?? "").replace(/\D/g, "");
  const d = await obterDicionario();
  if (codigo.length < 6) return { enviadoPara: email, erro: d.entrar.erroDigiteCodigo };

  const supabase = await criarClienteServidor();
  const { error } = await supabase.auth.verifyOtp({ email, token: codigo, type: "email" });
  if (error) return { enviadoPara: email, erro: d.entrar.erroCodigo };

  await marcarEvento("login", { method: "codigo" });
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
  // A cor escolhida é da conta: sem login, a Repasa volta ao verde padrão.
  (await cookies()).delete("repasa-tema");
  redirect("/");
}
