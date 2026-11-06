"use server";

import { cookies, headers } from "next/headers";
import type { EstadoFormulario } from "@/components/ui/Mensagem";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { avisoPalavrao } from "@/lib/palavroes/servidor";
import { COOKIE_IDIOMA, ehIdiomaSite, fmt } from "@/i18n/config";
import { dicionarios } from "@/i18n/dicionarios";
import { obterIdioma } from "@/i18n/servidor";

export async function cadastrar(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const senha = String(formData.get("senha") ?? "");
  const papel = formData.get("papel") === "aluno" ? "aluno" : "professor";
  const escolhido = formData.get("idioma");
  const idioma = ehIdiomaSite(escolhido) ? escolhido : await obterIdioma();
  // As mensagens já saem no idioma escolhido no formulário.
  const d = dicionarios[idioma];
  if (!nome || !email) return { erro: d.cadastro.erroPreencha };
  if (senha.length < 8) return { erro: d.cadastro.erroSenhaCurta };
  if (formData.get("aceite") !== "on") return { erro: d.cadastro.erroAceite };
  const palavrao = await avisoPalavrao(nome);
  if (palavrao) return { erro: palavrao };

  const origem = (await headers()).get("origin") ?? "";
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: { data: { nome, papel, idioma, aceite_termos_em: new Date().toISOString() }, emailRedirectTo: `${origem}/auth/confirmar?next=/${papel}` },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already")) return { erro: d.cadastro.erroJaExiste };
    return { erro: fmt(d.cadastro.erroCriar, { erro: error.message }) };
  }

  // Quando o e-mail já tem conta, o Supabase responde "ok" sem enviar nada e devolve o usuário sem identidades.
  if (data.user && data.user.identities?.length === 0) {
    return { erro: d.cadastro.erroJaExisteRepasa };
  }

  (await cookies()).set(COOKIE_IDIOMA, idioma, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  return { sucesso: fmt(d.cadastro.sucesso, { email }) };
}
