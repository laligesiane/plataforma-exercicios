"use server";

import { avisoPalavrao } from "@/lib/palavroes/servidor";
import { revalidatePath } from "next/cache";
import type { EstadoFormulario } from "@/components/ui/Mensagem";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export async function salvarNome(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const nome = String(formData.get("nome") ?? "").trim();
  if (!nome) return { erro: "Digite seu nome." };
  if (nome.length > 80) return { erro: "Use no máximo 80 letras." };
  const palavrao = await avisoPalavrao(nome);
  if (palavrao) return { erro: palavrao };

  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erro: "Entre de novo para salvar." };
  const { error } = await supabase.from("perfil").update({ nome }).eq("id", user.id);
  if (error) return { erro: "Não foi possível salvar o nome." };
  revalidatePath("/", "layout");
  return { sucesso: "Nome salvo." };
}

export async function salvarSenha(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const senha = String(formData.get("senha") ?? "");
  const confirmacao = String(formData.get("confirmacao") ?? "");
  if (senha.length < 8) return { erro: "A senha precisa ter pelo menos 8 caracteres." };
  if (senha !== confirmacao) return { erro: "As duas senhas não são iguais." };

  const supabase = await criarClienteServidor();
  const { error } = await supabase.auth.updateUser({ password: senha });
  if (error) {
    if (error.code === "same_password") return { erro: "Essa já é a sua senha atual." };
    if (error.code === "reauthentication_needed") return { erro: "Por segurança, saia e entre de novo antes de trocar a senha." };
    return { erro: `Não foi possível salvar a senha: ${error.message}` };
  }
  return { sucesso: "Senha salva. Da próxima vez você pode entrar com ela." };
}

export type EstadoMfa =
  | { etapa: "inicio"; erro?: string }
  | { etapa: "ler-qr"; fatorId: string; qr: string; chave: string; erro?: string }
  | { etapa: "ligado" };

/** Um só formulário com dois passos: gerar o QR code e confirmar o primeiro código. */
export async function passoMfa(estado: EstadoMfa, formData: FormData): Promise<EstadoMfa> {
  return formData.get("passo") === "confirmar" ? confirmarMfa(estado, formData) : iniciarMfa();
}

/** Passo 1: gera o QR code para o app autenticador. */
async function iniciarMfa(): Promise<EstadoMfa> {
  const supabase = await criarClienteServidor();
  // Tentativas anteriores que não foram confirmadas atrapalham um novo cadastro.
  const { data: fatores } = await supabase.auth.mfa.listFactors();
  for (const f of fatores?.all ?? []) {
    if (f.status === "unverified") await supabase.auth.mfa.unenroll({ factorId: f.id });
  }

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    issuer: "Repasa",
    friendlyName: `Repasa ${new Date().toISOString().slice(0, 16)}`,
  });
  if (error || !data) {
    if (error?.code === "mfa_totp_enroll_not_enabled") return { etapa: "inicio", erro: "A verificação em duas etapas ainda não foi ligada na Repasa." };
    return { etapa: "inicio", erro: `Não foi possível começar: ${error?.message ?? "erro desconhecido"}` };
  }
  return { etapa: "ler-qr", fatorId: data.id, qr: data.totp.qr_code, chave: data.totp.secret };
}

/** Passo 2: confere o primeiro código do app e liga a verificação. */
async function confirmarMfa(estado: EstadoMfa, formData: FormData): Promise<EstadoMfa> {
  if (estado.etapa !== "ler-qr") return estado;
  const codigo = String(formData.get("codigo") ?? "").replace(/\D/g, "");
  if (codigo.length !== 6) return { ...estado, erro: "Digite os 6 números que aparecem no app." };

  const supabase = await criarClienteServidor();
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: estado.fatorId, code: codigo });
  if (error) return { ...estado, erro: "Código errado. Use o código que está aparecendo agora no app." };
  revalidatePath("/perfil");
  return { etapa: "ligado" };
}

export async function desligarMfa(formData: FormData) {
  const fatorId = String(formData.get("fator") ?? "");
  const supabase = await criarClienteServidor();
  await supabase.auth.mfa.unenroll({ factorId: fatorId });
  revalidatePath("/perfil");
}

/** Cor da Repasa escolhida no perfil (mesma paleta da cor dos destaques do resumo). */
export async function salvarTema(tema: string): Promise<{ erro?: string }> {
  if (!["menta", "azul", "rosa", "roxo", "laranja"].includes(tema)) return { erro: "Cor inválida." };
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erro: "Entre de novo para salvar." };
  const { error } = await supabase.from("perfil").update({ tema }).eq("id", user.id);
  if (error) return { erro: "Não foi possível salvar a cor. Tente de novo." };
  return {};
}
