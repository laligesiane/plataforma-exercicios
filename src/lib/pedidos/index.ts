// Pedidos de aula do aluno: tipos, validação e textos (funções puras).

import { dataValida } from "../aulas";

export type StatusPedido = "pendente" | "aceito" | "recusado";

export type PedidoAula = {
  id: string;
  turma_id: string;
  aluno_id: string;
  data: string; // "AAAA-MM-DD"
  hora: string | null; // "HH:MM:SS"
  mensagem: string;
  status: StatusPedido;
  aula_id: string | null;
  criado_em: string;
};

export const camposPedido = "id, turma_id, aluno_id, data, hora, mensagem, status, aula_id, criado_em";

export const rotuloStatus: Record<StatusPedido, string> = {
  pendente: "Aguardando o professor",
  aceito: "Aula marcada",
  recusado: "Não deu desta vez",
};

export type EntradaPedido = { turmaId: string; data: string; hora: string | null; mensagem: string };

/** Valida o formulário "Pedir uma aula". Devolve o pedido ou a mensagem de erro. */
export function validarPedido(
  campos: { turma_id?: string; data?: string; hora?: string; mensagem?: string },
  turmasDoAluno: string[],
  hoje: string,
): { pedido: EntradaPedido } | { erro: string } {
  const turmaId = (campos.turma_id ?? "").trim();
  if (!turmasDoAluno.includes(turmaId)) return { erro: "Escolha a turma." };

  const data = (campos.data ?? "").trim();
  if (!dataValida(data)) return { erro: "Escolha o dia da aula." };
  if (data < hoje) return { erro: "Escolha um dia de hoje em diante." };

  const horaBruta = (campos.hora ?? "").trim();
  let hora: string | null = null;
  if (horaBruta) {
    const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(horaBruta);
    if (!m) return { erro: "Horário inválido." };
    hora = `${m[1]}:${m[2]}`;
  }

  return { pedido: { turmaId, data, hora, mensagem: (campos.mensagem ?? "").trim().slice(0, 1000) } };
}

/** Separa pedidos ainda por vir (pendentes ou aceitos com data futura) do histórico. */
export function separarPedidos<T extends Pick<PedidoAula, "data" | "status">>(pedidos: T[], hoje: string) {
  const ativos = pedidos
    .filter((p) => p.data >= hoje && p.status !== "recusado")
    .sort((a, b) => a.data.localeCompare(b.data));
  const passados = pedidos.filter((p) => !ativos.includes(p)).sort((a, b) => b.data.localeCompare(a.data));
  return { ativos, passados };
}

/** Aulas de hoje em diante, da mais próxima para a mais distante. */
export function proximasAulas<T extends { data: string }>(aulas: T[], hoje: string) {
  return aulas.filter((a) => a.data >= hoje).sort((a, b) => a.data.localeCompare(b.data));
}

/** Resumo com mapa mental de verdade (ao menos um ramo). */
export function temMapa(r: { mapa?: { ramos?: unknown[] } | null }) {
  return (r.mapa?.ramos?.length ?? 0) > 0;
}
