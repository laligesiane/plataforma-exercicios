/**
 * Textos de datas e agenda em português. Ficam num arquivo pequeno porque as funções de src/lib
 * usam como padrão (sem precisar carregar o dicionário inteiro). O pt.ts reaproveita.
 */
export const datasPt = {
  hoje: "Hoje",
  amanha: "Amanhã",
  atrasada: "Atrasada",
  ateData: "Até {data}",
  atrasadoData: "Atrasado · {data}",
  aulaDe: "Aula de {data}",
  aulaDaTurma: "Aula da turma",
  minhaAgenda: "Minha agenda",
  atividade: "Atividade",
  resumo: "Resumo",
  compromisso: "Compromisso",
  as: "{data} às {hora}",
  dias: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
  tiposCompromisso: { tarefa: "Tarefa", prova: "Prova", aula: "Aula", outro: "Compromisso" },
  tiposCalendario: { prova: "Prova", entrega: "Entrega", aula: "Aula", sem_aula: "Sem aula", outro: "Outro" },
  brotinho: {
    arvore: "{n} dias seguidos! Estou virando árvore.",
    meta: "Meta da semana cumprida! Cresci mais um pouco.",
    jaContou1: "Hoje já contou. Falta 1 dia para a meta da semana.",
    jaContouN: "Hoje já contou. Faltam {n} dias para a meta da semana.",
    sequencia1: "Sequência de 1 dia. Estude hoje para continuar.",
    sequenciaN: "Sequência de {n} dias. Estude hoje para continuar.",
    convite: "Que tal estudar um pouquinho hoje? Eu cresço junto com você.",
  },
};

type Textos<T> = T extends string ? string : T extends readonly (infer U)[] ? Textos<U>[] : { [K in keyof T]: Textos<T[K]> };
export type TextosDatas = Textos<typeof datasPt>;
