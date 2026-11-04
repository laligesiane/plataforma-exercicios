import { ehAutomatico, type Exercicio } from "./modelo";

type ItemQualquer = Exercicio["itens"][number];

/** Texto curto que identifica o item numa lista (resumo do aluno, painel do professor). */
export function textoDoItem(item: ItemQualquer) {
  switch (item.tipo) {
    case "classificar":
      return item.texto;
    case "relacionar":
      return `${item.esquerda} → ${item.direita}`;
    default:
      return item.enunciado;
  }
}

export type ResumoAtividade = {
  total: number;
  respondidos: number;
  certos: number;
  dePrimeira: number;
  porExercicio: { id: string; numero: number; titulo: string; total: number; certos: number }[];
  /** Itens respondidos que ainda estão errados na última tentativa. */
  errados: { itemId: string; exercicio: number; texto: string }[];
  semResposta: number;
};

/**
 * Resumo de acertos para o aluno. Não é nota: conta a última tentativa de cada item
 * e quantos ele acertou já na primeira.
 * `certos`: item → a última resposta está certa. `primeira`: item → a primeira resposta estava certa.
 */
export function resumirAtividade(
  exercicios: Exercicio[],
  certos: Record<string, boolean>,
  primeira: Record<string, boolean>,
): ResumoAtividade {
  const resumo: ResumoAtividade = {
    total: 0,
    respondidos: 0,
    certos: 0,
    dePrimeira: 0,
    porExercicio: [],
    errados: [],
    semResposta: 0,
  };

  exercicios.forEach((exercicio, i) => {
    // Produção (o professor corrige depois) e Kahoot não entram na contagem.
    if (!ehAutomatico(exercicio)) return;
    let certosDoExercicio = 0;
    for (const item of exercicio.itens) {
      resumo.total++;
      if (!(item.id in certos)) {
        resumo.semResposta++;
        continue;
      }
      resumo.respondidos++;
      if (certos[item.id]) {
        resumo.certos++;
        certosDoExercicio++;
      } else {
        resumo.errados.push({ itemId: item.id, exercicio: i + 1, texto: textoDoItem(item) });
      }
      if (primeira[item.id]) resumo.dePrimeira++;
    }
    resumo.porExercicio.push({
      id: exercicio.id,
      numero: i + 1,
      titulo: exercicio.titulo,
      total: exercicio.itens.length,
      certos: certosDoExercicio,
    });
  });

  return resumo;
}
