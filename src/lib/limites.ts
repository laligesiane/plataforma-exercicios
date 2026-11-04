/** Traduz os erros dos gatilhos de limite do banco (ver 0001_inicial.sql). */
export function mensagemDeLimite(mensagem: string): string | null {
  if (mensagem.includes("limite_turmas")) return "Seu plano atual não permite mais turmas.";
  if (mensagem.includes("limite_alunos")) return "Essa turma chegou ao limite de alunos do seu plano.";
  if (mensagem.includes("limite_atividades")) return "Uma das turmas marcadas já tem o máximo de atividades do seu plano.";
  return null;
}
