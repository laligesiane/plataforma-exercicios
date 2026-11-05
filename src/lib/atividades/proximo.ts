import { ehAutomatico, type Exercicio } from "./modelo";

/** Id do primeiro exercício (corrigido na hora) que ainda tem item sem resposta, ou null se tudo foi respondido. */
export function proximoPendente(exercicios: Exercicio[], respondidos: Record<string, boolean>): string | null {
  for (const e of exercicios) {
    if (!ehAutomatico(e)) continue;
    if (e.itens.some((item) => !(item.id in respondidos))) return e.id;
  }
  return null;
}

/** id do elemento de cada exercício na página, para rolar até ele. */
export const idExercicio = (id: string) => `exercicio-${id}`;
