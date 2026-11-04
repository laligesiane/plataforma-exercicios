import type { ItemLacuna, ItemMultiplaEscolha } from "@/lib/correcao";

// Exemplos provisórios até termos exercícios reais da professora.
export const lacunasDemo: ItemLacuna[] = [
  {
    tipo: "lacuna",
    enunciado: "Cuando era niño, ___ al parque todos los días.",
    aceitas: ["iba"],
    errosPrevistos: [
      { valor: "fui", explicacao: "É uma ação habitual no passado, então pede pretérito imperfeito (iba), não indefinido (fui)." },
      { valor: "voy", explicacao: "'Cuando era niño' situa a frase no passado; o presente não serve aqui." },
    ],
    explicacaoPadrao: "Para hábitos no passado, use o pretérito imperfeito: iba, comía, jugaba.",
    grafiaExata: false,
  },
  {
    tipo: "lacuna",
    enunciado: "Después de la lluvia salió el ___.",
    aceitas: ["arcoíris"],
    errosPrevistos: [{ valor: "arco", explicacao: "Falta a segunda parte da palavra: arcoíris." }],
    explicacaoPadrao: "A palavra é arcoíris.",
    grafiaExata: false,
  },
];

export const multiplaEscolhaDemo: ItemMultiplaEscolha[] = [
  {
    tipo: "multipla_escolha",
    enunciado: "Vivo ___ Madrid.",
    alternativas: [
      { id: "a", texto: "a", correta: false, explicacao: "'A' indica direção (voy a Madrid). Para onde se vive, use 'en'." },
      { id: "b", texto: "en", correta: true, explicacao: "'En' indica o lugar onde se está." },
      { id: "c", texto: "de", correta: false, explicacao: "'De' indica origem (soy de Madrid), não onde se vive." },
    ],
    explicacaoPadrao: "Para o lugar onde se está ou se vive, use 'en'.",
  },
];
