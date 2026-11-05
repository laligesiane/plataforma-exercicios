/** Contas do modo aula ao vivo: o professor acompanha a turma fazendo uma atividade agora. */

export type RespostaAoVivo = { aluno_id: string; item_id: string; status: string; criada_em: string };

/** Minutos sem responder para o aluno deixar de contar como "respondendo agora". */
export const MINUTOS_ATIVO = 2;

export type ItemAoVivo = {
  itemId: string;
  responderam: number;
  /** Acertaram na primeira tentativa. */
  deCara: number;
  /** A última resposta ainda está errada. */
  aindaErrados: string[];
};

export type AlunoAoVivo = { alunoId: string; respondidos: number; acertosDeCara: number; ativo: boolean; ultimaVez: string | null };

const certo = (status: string) => status === "certo" || status === "certo_com_aviso";

export function painelAoVivo(alunos: string[], itens: string[], respostas: RespostaAoVivo[], agora = new Date()) {
  const daTurma = new Set(alunos);
  const doItem = new Set(itens);
  const validas = respostas
    .filter((r) => daTurma.has(r.aluno_id) && doItem.has(r.item_id))
    .sort((a, b) => a.criada_em.localeCompare(b.criada_em));

  const primeira = new Map<string, RespostaAoVivo>();
  const ultima = new Map<string, RespostaAoVivo>();
  for (const r of validas) {
    const chave = `${r.aluno_id}|${r.item_id}`;
    if (!primeira.has(chave)) primeira.set(chave, r);
    ultima.set(chave, r);
  }

  const porItem: ItemAoVivo[] = itens.map((itemId) => {
    const doItem = alunos.filter((a) => primeira.has(`${a}|${itemId}`));
    return {
      itemId,
      responderam: doItem.length,
      deCara: doItem.filter((a) => certo(primeira.get(`${a}|${itemId}`)!.status)).length,
      aindaErrados: doItem.filter((a) => !certo(ultima.get(`${a}|${itemId}`)!.status)),
    };
  });

  const limite = agora.getTime() - MINUTOS_ATIVO * 60_000;
  const porAluno: AlunoAoVivo[] = alunos.map((alunoId) => {
    const deles = itens.filter((i) => primeira.has(`${alunoId}|${i}`));
    const ultimaVez = validas.filter((r) => r.aluno_id === alunoId).at(-1)?.criada_em ?? null;
    return {
      alunoId,
      respondidos: deles.length,
      acertosDeCara: deles.filter((i) => certo(primeira.get(`${alunoId}|${i}`)!.status)).length,
      ativo: ultimaVez !== null && new Date(ultimaVez).getTime() >= limite,
      ultimaVez,
    };
  });

  return {
    porItem,
    porAluno,
    ativos: porAluno.filter((a) => a.ativo).length,
    terminaram: itens.length > 0 ? porAluno.filter((a) => a.respondidos === itens.length).length : 0,
  };
}
