/** Contas da visão da turma inteira: andamento de cada aluno e os itens que a turma mais erra. */

export type RespostaTurma = { aluno_id: string; atividade_id: string; item_id: string; status: string; criada_em: string };
export type AtividadeTurma = { id: string; titulo: string; totalItens: number };

export type SituacaoAluno = "em_dia" | "parado" | "sem_comecar";

export type LinhaAluno = {
  alunoId: string;
  /** Atividades em que respondeu todos os itens. */
  concluidas: number;
  /** Atividades com ao menos uma resposta, mas incompletas. */
  emAndamento: number;
  /** Acertos na última resposta de cada item, sobre os itens respondidos (0 a 1), ou null sem respostas. */
  aproveitamento: number | null;
  /** Data da última resposta (ISO), ou null. */
  ultimaVez: string | null;
  situacao: SituacaoAluno;
};

export type ItemDificil = { atividadeId: string; itemId: string; alunosComErro: number; alunosQueResponderam: number };

/** Dias sem responder nada para o aluno contar como parado. */
export const DIAS_PARADO = 7;

export function andamentoDosAlunos(
  alunos: string[],
  atividades: AtividadeTurma[],
  respostas: RespostaTurma[],
  agora = new Date(),
): LinhaAluno[] {
  const ids = new Set(atividades.map((a) => a.id));
  return alunos.map((alunoId) => {
    const dele = respostas.filter((r) => r.aluno_id === alunoId && ids.has(r.atividade_id));
    const ultima = ultimaPorItem(dele);
    let concluidas = 0;
    let emAndamento = 0;
    for (const a of atividades) {
      const respondidos = [...ultima.values()].filter((r) => r.atividade_id === a.id).length;
      if (respondidos === 0) continue;
      if (a.totalItens > 0 && respondidos >= a.totalItens) concluidas++;
      else emAndamento++;
    }
    const finais = [...ultima.values()];
    const certos = finais.filter((r) => r.status !== "errado").length;
    const ultimaVez = dele.reduce<string | null>((max, r) => (!max || r.criada_em > max ? r.criada_em : max), null);
    const diasSem = ultimaVez ? (agora.getTime() - new Date(ultimaVez).getTime()) / 86_400_000 : Infinity;
    return {
      alunoId,
      concluidas,
      emAndamento,
      aproveitamento: finais.length ? certos / finais.length : null,
      ultimaVez,
      situacao: !ultimaVez ? "sem_comecar" : diasSem >= DIAS_PARADO ? "parado" : "em_dia",
    };
  });
}

/** Itens em que mais alunos erraram pelo menos uma vez, do mais difícil para o menos. */
export function itensMaisErrados(respostas: RespostaTurma[], alunos: string[], limite = 8): ItemDificil[] {
  const daTurma = new Set(alunos);
  const porItem = new Map<string, { atividadeId: string; itemId: string; erraram: Set<string>; responderam: Set<string> }>();
  for (const r of respostas) {
    if (!daTurma.has(r.aluno_id)) continue;
    const chave = `${r.atividade_id}:${r.item_id}`;
    const atual = porItem.get(chave) ?? { atividadeId: r.atividade_id, itemId: r.item_id, erraram: new Set(), responderam: new Set() };
    atual.responderam.add(r.aluno_id);
    if (r.status === "errado") atual.erraram.add(r.aluno_id);
    porItem.set(chave, atual);
  }
  return [...porItem.values()]
    .filter((i) => i.erraram.size > 0)
    .map((i) => ({ atividadeId: i.atividadeId, itemId: i.itemId, alunosComErro: i.erraram.size, alunosQueResponderam: i.responderam.size }))
    .sort((a, b) => b.alunosComErro - a.alunosComErro || b.alunosComErro / b.alunosQueResponderam - a.alunosComErro / a.alunosQueResponderam)
    .slice(0, limite);
}

function ultimaPorItem(respostas: RespostaTurma[]) {
  const ultima = new Map<string, RespostaTurma>();
  for (const r of [...respostas].sort((a, b) => a.criada_em.localeCompare(b.criada_em))) {
    ultima.set(`${r.atividade_id}:${r.item_id}`, r);
  }
  return ultima;
}
