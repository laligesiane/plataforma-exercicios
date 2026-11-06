/** Coleção de árvores do modo foco: as espécies que o aluno pode ganhar e os selos das metas. */

import { fmt } from "../../i18n/config";
import { focoPt, seloTx, type TextosFoco } from "../../i18n/dicionarios/focoPt";

export type Especie = {
  id: string;
  nome: string;
  frase: string;
  /** Formato da copa. */
  forma: "redonda" | "pinheiro";
  copa: string;
  copaClara: string;
  tronco: string;
  enfeite: "flor" | "fruta" | "folha" | "pinha" | "brilho";
  corEnfeite: string;
  corMiolo: string;
};

export const ESPECIES: Especie[] = [
  {
    id: "brotinho",
    nome: "Árvore do Brotinho",
    frase: "A primeira de todas, verdinha e florida.",
    forma: "redonda",
    copa: "#0f9d6b",
    copaClara: "#34c38f",
    tronco: "#9a6b47",
    enfeite: "flor",
    corEnfeite: "#ffc2cf",
    corMiolo: "#ffd166",
  },
  {
    id: "ipe-amarelo",
    nome: "Ipê-amarelo",
    frase: "Floresce no fim do inverno e pinta a cidade de amarelo.",
    forma: "redonda",
    copa: "#f2b632",
    copaClara: "#ffd666",
    tronco: "#8a5a3b",
    enfeite: "flor",
    corEnfeite: "#fff1b8",
    corMiolo: "#e0901c",
  },
  {
    id: "ipe-roxo",
    nome: "Ipê-roxo",
    frase: "Um dos primeiros ipês a florir no ano.",
    forma: "redonda",
    copa: "#9b6bd6",
    copaClara: "#c3a3f0",
    tronco: "#8a5a3b",
    enfeite: "flor",
    corEnfeite: "#f1e6ff",
    corMiolo: "#ffd166",
  },
  {
    id: "cerejeira",
    nome: "Cerejeira",
    frase: "Floração rosinha que dura poucos dias. Aproveite!",
    forma: "redonda",
    copa: "#f59ab8",
    copaClara: "#ffc7da",
    tronco: "#7a4a35",
    enfeite: "flor",
    corEnfeite: "#ffffff",
    corMiolo: "#e5578a",
  },
  {
    id: "laranjeira",
    nome: "Laranjeira",
    frase: "Cheia de laranjas para o suco depois do estudo.",
    forma: "redonda",
    copa: "#1f8f4e",
    copaClara: "#4cbf72",
    tronco: "#9a6b47",
    enfeite: "fruta",
    corEnfeite: "#ff9f1c",
    corMiolo: "#2e7d32",
  },
  {
    id: "macieira",
    nome: "Macieira",
    frase: "Uma maçã por dia e uma árvore por sessão.",
    forma: "redonda",
    copa: "#2e9e5b",
    copaClara: "#5fcf86",
    tronco: "#8a5a3b",
    enfeite: "fruta",
    corEnfeite: "#e63946",
    corMiolo: "#2e7d32",
  },
  {
    id: "jabuticabeira",
    nome: "Jabuticabeira",
    frase: "Bem brasileira: as frutinhas nascem até no tronco.",
    forma: "redonda",
    copa: "#2f7d4f",
    copaClara: "#58a874",
    tronco: "#a07a5a",
    enfeite: "fruta",
    corEnfeite: "#3b1f4a",
    corMiolo: "#3b1f4a",
  },
  {
    id: "outono",
    nome: "Árvore de outono",
    frase: "Folhas laranjinhas caindo devagar.",
    forma: "redonda",
    copa: "#e8743b",
    copaClara: "#f5a25d",
    tronco: "#7a4a35",
    enfeite: "folha",
    corEnfeite: "#c94f2a",
    corMiolo: "#c94f2a",
  },
  {
    id: "pinheiro",
    nome: "Pinheiro",
    frase: "Firme o ano inteiro, como quem estuda todo dia.",
    forma: "pinheiro",
    copa: "#1d6b4a",
    copaClara: "#2f8f63",
    tronco: "#8a5a3b",
    enfeite: "pinha",
    corEnfeite: "#9a6b47",
    corMiolo: "#6e4529",
  },
  {
    id: "araucaria",
    nome: "Araucária",
    frase: "A árvore do pinhão, símbolo do Sul.",
    forma: "pinheiro",
    copa: "#3a7d44",
    copaClara: "#5aa060",
    tronco: "#7a4a35",
    enfeite: "brilho",
    corEnfeite: "#ffe08a",
    corMiolo: "#ffe08a",
  },
];

export function especiePorId(id: string | null | undefined): Especie {
  return ESPECIES.find((e) => e.id === id) ?? ESPECIES[0];
}

/**
 * Escolhe a espécie da árvore que acabou de crescer: primeiro as que o aluno ainda não tem
 * (para completar a coleção); com todas, qualquer uma diferente da última.
 */
export function escolherEspecie(colecionadas: string[], ultima: string | null, sorteio: () => number = Math.random): string {
  const tem = new Set(colecionadas);
  const novas = ESPECIES.filter((e) => !tem.has(e.id));
  const opcoes = novas.length > 0 ? novas : ESPECIES.filter((e) => e.id !== ultima);
  const i = Math.min(opcoes.length - 1, Math.floor(sorteio() * opcoes.length));
  return opcoes[i].id;
}

export type ArvoreColhida = { especie: string; minutos: number; dia: string };

type Medida = "arvores" | "noDia" | "seguidos" | "minutos" | "especies";

export type DefSelo = { id: string; nome: string; meta: number; medida: Medida; descricao: string; marca: string; cor: string };

export const SELOS: DefSelo[] = [
  { id: "primeira", nome: "Primeira árvore", meta: 1, medida: "arvores", descricao: "Termine sua primeira sessão de foco.", marca: "1", cor: "#34c38f" },
  { id: "jardim-do-dia", nome: "Jardim do dia", meta: 3, medida: "noDia", descricao: "Plante 3 árvores no mesmo dia.", marca: "3", cor: "#f2b632" },
  { id: "bosque-do-dia", nome: "Bosque do dia", meta: 5, medida: "noDia", descricao: "Plante 5 árvores no mesmo dia.", marca: "5", cor: "#e8743b" },
  { id: "ritmo", nome: "Pegando o ritmo", meta: 3, medida: "seguidos", descricao: "Plante pelo menos uma árvore 3 dias seguidos.", marca: "3d", cor: "#5aa9e6" },
  { id: "constancia", nome: "Constância", meta: 5, medida: "seguidos", descricao: "Plante pelo menos uma árvore 5 dias seguidos.", marca: "5d", cor: "#9b6bd6" },
  { id: "semana", nome: "Semana inteira", meta: 7, medida: "seguidos", descricao: "Plante pelo menos uma árvore 7 dias seguidos.", marca: "7d", cor: "#e5578a" },
  { id: "pequeno-bosque", nome: "Pequeno bosque", meta: 10, medida: "arvores", descricao: "Junte 10 árvores na coleção.", marca: "10", cor: "#1f8f4e" },
  { id: "dez-horas", nome: "10 horas de foco", meta: 600, medida: "minutos", descricao: "Some 10 horas de estudo no modo foco.", marca: "10h", cor: "#2f6fd6" },
  { id: "colecionador", nome: "Colecionador", meta: ESPECIES.length, medida: "especies", descricao: "Ganhe todas as espécies de árvore.", marca: "★", cor: "#c79a1e" },
  { id: "floresta", nome: "Floresta", meta: 50, medida: "arvores", descricao: "Junte 50 árvores na coleção.", marca: "50", cor: "#1d6b4a" },
];

export type Selo = DefSelo & { atual: number; conquistado: boolean };

/** Dias (AAAA-MM-DD) para número de dias, sem fuso: só a conta de dias seguidos importa. */
function numeroDoDia(dia: string) {
  const [a, m, d] = dia.split("-").map(Number);
  return Math.round(Date.UTC(a, m - 1, d) / 86_400_000);
}

/** Maior sequência de dias seguidos com pelo menos uma árvore. */
export function maiorSequencia(dias: string[]) {
  const nums = [...new Set(dias.map(numeroDoDia))].sort((a, b) => a - b);
  let maior = 0;
  let atual = 0;
  nums.forEach((n, i) => {
    atual = i > 0 && n === nums[i - 1] + 1 ? atual + 1 : 1;
    maior = Math.max(maior, atual);
  });
  return maior;
}

/** Sequência que ainda está valendo: termina hoje ou ontem (hoje ainda dá tempo de plantar). */
export function sequenciaAtual(dias: string[], hoje: string) {
  const tem = new Set(dias.map(numeroDoDia));
  let n = numeroDoDia(hoje);
  if (!tem.has(n)) n -= 1;
  let total = 0;
  while (tem.has(n)) {
    total += 1;
    n -= 1;
  }
  return total;
}

export function resumoDaColecao(arvores: ArvoreColhida[]) {
  const porDia = new Map<string, number>();
  for (const a of arvores) porDia.set(a.dia, (porDia.get(a.dia) ?? 0) + 1);
  return {
    arvores: arvores.length,
    minutos: arvores.reduce((s, a) => s + a.minutos, 0),
    noDia: Math.max(0, ...porDia.values()),
    seguidos: maiorSequencia(arvores.map((a) => a.dia)),
    especies: new Set(arvores.map((a) => a.especie)).size,
  };
}

export function calcularSelos(arvores: ArvoreColhida[]): Selo[] {
  const r = resumoDaColecao(arvores);
  return SELOS.map((s) => ({ ...s, atual: Math.min(s.meta, r[s.medida]), conquistado: r[s.medida] >= s.meta }));
}

/** Selos que a árvore nova acabou de dar. */
export function selosNovos(antes: ArvoreColhida[], depois: ArvoreColhida[]): Selo[] {
  const ja = new Set(calcularSelos(antes).filter((s) => s.conquistado).map((s) => s.id));
  return calcularSelos(depois).filter((s) => s.conquistado && !ja.has(s.id));
}

/** Uma frase sobre a próxima meta, para dar vontade de plantar mais uma. */
export function proximaMeta(arvores: ArvoreColhida[], hoje: string, t: TextosFoco = focoPt): string | null {
  const hojeTotal = arvores.filter((a) => a.dia === hoje).length;
  const selos = calcularSelos(arvores);
  const falta = (id: string) => selos.find((s) => s.id === id && !s.conquistado);
  const doDia = falta("jardim-do-dia") ?? falta("bosque-do-dia");
  if (doDia && hojeTotal < doDia.meta) {
    const n = doDia.meta - hojeTotal;
    return fmt(t.metaDoDia, { arvores: n === 1 ? t.arvore1 : fmt(t.arvoresN, { n }), selo: seloTx(t, doDia.id).nome });
  }
  const seguidos = falta("ritmo") ?? falta("constancia") ?? falta("semana");
  if (seguidos) {
    const atual = sequenciaAtual(arvores.map((a) => a.dia), hoje);
    const n = seguidos.meta - atual;
    if (atual > 0 && n > 0)
      return fmt(t.metaSeguidos, { dias: atual === 1 ? t.dia1 : fmt(t.diasN, { n: atual }), n, selo: seloTx(t, seguidos.id).nome });
  }
  const especies = new Set(arvores.map((a) => a.especie)).size;
  if (especies < ESPECIES.length) return fmt(t.metaEspecies, { n: especies, total: ESPECIES.length });
  return null;
}

/** Aceita só AAAA-MM-DD a até um dia de distância do relógio do servidor (fusos diferentes). */
export function diaValido(dia: string, agora = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dia)) return false;
  const hoje = Math.floor(agora.getTime() / 86_400_000);
  return Math.abs(numeroDoDia(dia) - hoje) <= 1;
}
