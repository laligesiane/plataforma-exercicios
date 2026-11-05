/** Um atalho do cartão "Continuar de onde parou". */
export type Continuar = { href: string; tipo: "Atividade" | "Resumo"; titulo: string; quando: string };

type Resposta = { atividade_id: string; criada_em: string };
type Atividade = { id: string; titulo: string };
type ResumoRecente = { id: string; titulo_exibido: string; atualizado_em: string };

/**
 * Até dois atalhos, o mais recente primeiro: a última atividade que o aluno começou
 * e ainda não enviou, e o último resumo mexido (dele ou da turma).
 */
export function continuarDeOndeParou(
  respostas: Resposta[],
  atividades: Map<string, Atividade>,
  enviadas: Set<string>,
  resumos: ResumoRecente[],
): Continuar[] {
  const itens: Continuar[] = [];
  const ultima = [...respostas]
    .sort((a, b) => b.criada_em.localeCompare(a.criada_em))
    .find((r) => atividades.has(r.atividade_id) && !enviadas.has(r.atividade_id));
  if (ultima) {
    const a = atividades.get(ultima.atividade_id)!;
    itens.push({ href: `/atividades/${a.id}`, tipo: "Atividade", titulo: a.titulo, quando: ultima.criada_em });
  }
  const resumo = [...resumos].sort((a, b) => b.atualizado_em.localeCompare(a.atualizado_em))[0];
  if (resumo) itens.push({ href: `/aluno/resumos/${resumo.id}`, tipo: "Resumo", titulo: resumo.titulo_exibido, quando: resumo.atualizado_em });
  return itens.sort((a, b) => b.quando.localeCompare(a.quando));
}
