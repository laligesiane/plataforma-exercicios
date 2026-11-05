/** Revisão espaçada: em quantos dias o item volta, conforme a etapa em que está. */
export const intervalos = [1, 3, 7] as const;
export const ultimaEtapa = intervalos.length - 1;

export type Andamento = { etapa: number; proximaEm: string; concluida: boolean };

/** Soma dias a uma data "AAAA-MM-DD". */
export function somarDias(data: string, dias: number) {
  const [a, m, d] = data.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d + dias)).toISOString().slice(0, 10);
}

/**
 * Próximo passo de um item depois da revisão de hoje.
 * Errou: volta para amanhã, do começo. Acertou: sobe uma etapa (3 dias, depois 7); na última, conclui.
 */
export function avancar(etapa: number, acertou: boolean, hoje: string): Andamento {
  if (!acertou) return { etapa: 0, proximaEm: somarDias(hoje, intervalos[0]), concluida: false };
  if (etapa >= ultimaEtapa) return { etapa: ultimaEtapa, proximaEm: hoje, concluida: true };
  const nova = etapa + 1;
  return { etapa: nova, proximaEm: somarDias(hoje, intervalos[nova]), concluida: false };
}

/** Texto curto para o aluno depois de responder. */
export function quandoVolta(andamento: Andamento) {
  if (andamento.concluida) return "Dominado! Este item saiu da revisão.";
  const dias = intervalos[andamento.etapa];
  return dias === 1 ? "Volta amanhã." : `Volta em ${dias} dias.`;
}
