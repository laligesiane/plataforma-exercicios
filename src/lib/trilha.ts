/** Trilha: com ela ligada, só a primeira atividade ainda não enviada fica aberta; as seguintes esperam. */
export function estadoTrilha<T extends { id: string }>(ordenadas: T[], enviadas: Set<string>, ligada: boolean) {
  let proximaAchada = false;
  return ordenadas.map((a) => {
    const enviada = enviadas.has(a.id);
    let liberada = true;
    if (ligada && !enviada) {
      liberada = !proximaAchada;
      proximaAchada = true;
    }
    return { ...a, enviada, liberada };
  });
}

/** Ordem nova para quem entra no fim da trilha: segundos desde 1970 cabem num int e sempre crescem. */
export function ordemNoFim(agora = Date.now()) {
  return Math.floor(agora / 1000);
}
