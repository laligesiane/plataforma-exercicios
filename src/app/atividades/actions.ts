"use server";

import { ehUuid } from "@/lib/atividades/modelo";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import type { ProducaoSalva } from "@/components/exercicios/Producao";
import type { DuvidaSalva } from "@/components/exercicios/NaoEntendi";
import { montarProducoes, type LinhaProducao } from "@/lib/atividades/producoes";

const status = new Set(["certo", "certo_com_aviso", "errado"]);

export type NovaResposta = {
  atividadeId: string;
  exercicioId: string;
  itemId: string;
  valor: string;
  status: string;
};

/** Grava a resposta de um aluno da turma. O RLS recusa quem não é aluno da atividade. */
export async function registrarResposta(r: NovaResposta): Promise<boolean> {
  if (!ehUuid(r.atividadeId) || !ehUuid(r.exercicioId) || !status.has(r.status)) return false;
  if (typeof r.itemId !== "string" || typeof r.valor !== "string") return false;

  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("resposta").insert({
    atividade_id: r.atividadeId,
    exercicio_id: r.exercicioId,
    item_id: r.itemId.slice(0, 64),
    valor: r.valor.slice(0, 500),
    status: r.status,
  });
  return !error;
}

export type NovoEnvio = { atividadeId: string; certos: number; dePrimeira: number; total: number };

/** Registra "Enviar respostas" de um aluno da turma (o RLS recusa os demais). */
export async function registrarEnvio(e: NovoEnvio): Promise<boolean> {
  const inteiro = (n: unknown) => Number.isInteger(n) && (n as number) >= 0 && (n as number) <= 10000;
  if (!ehUuid(e.atividadeId) || !inteiro(e.certos) || !inteiro(e.dePrimeira) || !inteiro(e.total)) return false;

  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("envio").insert({
    atividade_id: e.atividadeId,
    certos: e.certos,
    de_primeira: e.dePrimeira,
    total: e.total,
  });
  return !error;
}

export type NovaProducao = {
  atividadeId: string;
  exercicioId: string;
  itemId: string;
  /** Produção escrita. */
  texto?: string;
  /** Produção oral: caminho do áudio já enviado ao bucket "producao". */
  audio?: string;
};

/**
 * Grava (ou troca pela versão nova) a produção escrita ou oral de um aluno da turma.
 * O RLS recusa quem não é aluno da atividade.
 */
export async function enviarProducao(p: NovaProducao): Promise<{ ok: true; salva: ProducaoSalva } | { ok: false; erro: string }> {
  const invalido = { ok: false as const, erro: "Não deu para enviar. Recarregue a página e tente de novo." };
  if (!ehUuid(p.atividadeId) || !ehUuid(p.exercicioId) || typeof p.itemId !== "string" || p.itemId.length > 64) return invalido;

  const supabase = await criarClienteServidor();
  const { data: usuario } = await supabase.auth.getUser();
  if (!usuario.user) return { ok: false, erro: "Sua sessão expirou. Entre de novo para enviar." };

  const texto = typeof p.texto === "string" ? p.texto.trim().slice(0, 5000) : "";
  // O áudio tem de estar na pasta do próprio aluno, dentro desta atividade.
  const pasta = `${usuario.user.id}/${p.atividadeId}/`;
  const audio = typeof p.audio === "string" && p.audio.startsWith(pasta) && /^[\w./-]+$/.test(p.audio) ? p.audio : null;
  if (!texto && !audio) return { ok: false, erro: "Escreva ou grave sua resposta antes de enviar." };

  const { data, error } = await supabase
    .from("producao")
    .upsert(
      {
        atividade_id: p.atividadeId,
        exercicio_id: p.exercicioId,
        item_id: p.itemId,
        texto,
        audio,
        enviada_em: new Date().toISOString(),
      },
      { onConflict: "aluno_id,atividade_id,item_id" },
    )
    .select("id, texto, audio, enviada_em, correcao(avaliacao, comentario, corrigida_em)")
    .single();
  if (error || !data) return { ok: false, erro: "Não deu para enviar. Confira sua conexão e tente de novo." };

  const [salva] = await montarProducoes(supabase, [data as unknown as LinhaProducao]);
  return { ok: true, salva: salva[1] };
}

/** Manda a dúvida do aluno sobre um exercício. O RLS recusa quem não é aluno da atividade. */
export async function enviarDuvida(
  atividadeId: string,
  exercicioId: string,
  texto: string,
): Promise<{ ok: true; duvida: DuvidaSalva } | { ok: false; erro: string }> {
  if (!ehUuid(atividadeId) || !ehUuid(exercicioId) || typeof texto !== "string") return { ok: false, erro: "Recarregue a página e tente de novo." };
  const limpo = texto.trim().slice(0, 1000);
  if (!limpo) return { ok: false, erro: "Escreva o que você não entendeu." };

  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from("duvida")
    .insert({ atividade_id: atividadeId, exercicio_id: exercicioId, texto: limpo })
    .select("id, texto, resposta, criada_em")
    .single();
  if (error || !data) return { ok: false, erro: "Não deu para enviar. Confira sua conexão." };
  return { ok: true, duvida: data as DuvidaSalva };
}
