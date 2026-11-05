/**
 * Limites do plano grátis.
 *
 * Por enquanto a Repasa é ilimitada para todo mundo (decidido em 05/11/2026, para ganhar usuários).
 * Para voltar com os limites:
 *   1. troque LIMITES_LIGADOS para true;
 *   2. rode no Supabase o bloco "para voltar" no fim da migration 0032_sem_limites.sql.
 * Com a chave desligada, as telas não mostram plano, contagem "X de Y" nem aviso de limite.
 */
export const LIMITES_LIGADOS: boolean = false;

/** O limite que vale na tela: null quando não há limite (chave desligada ou plano sem limite no banco). */
export function limite(valor: number | null | undefined): number | null {
  if (!LIMITES_LIGADOS || valor == null) return null;
  return valor;
}

/** true quando já chegou ao limite. Sem limite, nunca chega. */
export function chegouAoLimite(atual: number, valor: number | null | undefined): boolean {
  const max = limite(valor);
  return max != null && atual >= max;
}

/** Traduz os erros dos gatilhos de limite do banco (ver 0001_inicial.sql). */
export function mensagemDeLimite(mensagem: string): string | null {
  if (mensagem.includes("limite_turmas")) return "Seu plano atual não permite mais turmas.";
  if (mensagem.includes("limite_alunos")) return "Essa turma chegou ao limite de alunos do seu plano.";
  if (mensagem.includes("limite_atividades")) return "Uma das turmas marcadas já tem o máximo de atividades do seu plano.";
  if (mensagem.includes("limite_materias")) return "Seu plano atual não permite mais matérias.";
  return null;
}
