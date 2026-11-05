import {
  limparExercicio,
  novoId,
  problemasDoItem,
  type Exercicio,
  type ExercicioAutomatico,
} from "../atividades/modelo";

/** Tipos que o aluno pode gerar: os que o Repasa corrige na hora (produção precisa de professor). */
export const tiposGeraveis = {
  lacuna: "Completar lacunas",
  multipla_escolha: "Múltipla escolha",
  arrastar: "Arrastar palavras",
  classificar: "Classificar em colunas",
  relacionar: "Relacionar",
} as const;
export type TipoGeravel = keyof typeof tiposGeraveis;

export function ehTipoGeravel(v: unknown): v is TipoGeravel {
  return typeof v === "string" && v in tiposGeraveis;
}

export const QUANTIDADES = [3, 5, 8] as const;

// ---------- Forma que pedimos à IA (JSON Schema para structured outputs) ----------

const texto = { type: "string" } as const;
const listaTextos = { type: "array", items: texto } as const;
const obj = (props: Record<string, unknown>) => ({
  type: "object",
  properties: props,
  required: Object.keys(props),
  additionalProperties: false,
});
const erros = { type: "array", items: obj({ valor: texto, explicacao: texto }) };
const cabecalho = (tipo: TipoGeravel) => ({ tipo: { type: "string", enum: [tipo] }, titulo: texto, instrucoes: texto });

const esquemas: Record<TipoGeravel, object> = {
  lacuna: obj({
    ...cabecalho("lacuna"),
    itens: {
      type: "array",
      items: obj({ enunciado: texto, aceitas: listaTextos, errosPrevistos: erros, explicacaoPadrao: texto }),
    },
  }),
  multipla_escolha: obj({
    ...cabecalho("multipla_escolha"),
    itens: {
      type: "array",
      items: obj({
        enunciado: texto,
        alternativas: { type: "array", items: obj({ texto, correta: { type: "boolean" }, explicacao: texto }) },
        explicacaoPadrao: texto,
      }),
    },
  }),
  arrastar: obj({
    ...cabecalho("arrastar"),
    palavrasExtras: listaTextos,
    itens: { type: "array", items: obj({ enunciado: texto, resposta: texto, explicacaoPadrao: texto }) },
  }),
  classificar: obj({
    ...cabecalho("classificar"),
    colunas: listaTextos,
    itens: { type: "array", items: obj({ texto, coluna: texto, explicacao: texto }) },
  }),
  relacionar: obj({
    ...cabecalho("relacionar"),
    itens: { type: "array", items: obj({ esquerda: texto, direita: texto, explicacao: texto }) },
  }),
};

export function esquemaDaGeracao(tipos: TipoGeravel[]) {
  const unicos = [...new Set(tipos)];
  return obj({
    titulo: texto,
    exercicios: { type: "array", items: unicos.length === 1 ? esquemas[unicos[0]] : { anyOf: unicos.map((t) => esquemas[t]) } },
  });
}

/** Como cada tipo deve ser escrito. Vai no pedido à IA. */
export const regrasDosTipos: Record<TipoGeravel, string> = {
  lacuna:
    'Completar lacunas: cada item é uma frase com exatamente uma lacuna marcada como ___ (três sublinhados). "aceitas" lista as respostas certas (a principal primeiro, depois variações aceitáveis). "errosPrevistos" traz erros comuns com a explicação de cada um. "explicacaoPadrao" explica a resposta certa para quem errou.',
  multipla_escolha:
    "Múltipla escolha: cada item tem uma pergunta e de 3 a 4 alternativas, exatamente uma correta. Toda alternativa errada tem uma explicação curta de por que está errada; na certa, a explicação pode ficar vazia. \"explicacaoPadrao\" resume a resposta certa.",
  arrastar:
    'Arrastar palavras: cada item é uma frase com exatamente uma lacuna ___ e "resposta" é a palavra (ou expressão curta) que entra nela. As respostas dos itens formam o banco de palavras; "palavrasExtras" traz 1 a 3 palavras plausíveis para despistar. "explicacaoPadrao" explica a resposta certa.',
  classificar:
    'Classificar em colunas: "colunas" tem de 2 a 4 nomes curtos de categorias. Cada item é um cartão curto ("texto") e "coluna" é exatamente o nome de uma das colunas. "explicacao" diz por que o cartão vai nessa coluna.',
  relacionar:
    'Relacionar: cada item é um par (por exemplo, termo e definição, causa e efeito, data e fato). "esquerda" e "direita" são curtos, e nenhum lado se repete. "explicacao" ajuda quem ligou errado.',
};

// ---------- Conversão da resposta da IA para os exercícios do editor ----------

type Bruto = Record<string, unknown>;
const t = (v: unknown) => (typeof v === "string" ? v : "");
const lista = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const textos = (v: unknown) => lista(v).map(t).filter((x) => x.trim());

/** Normaliza a lacuna: a IA às vezes escreve ____ ou ___ com espaços diferentes. */
function normalizarLacuna(frase: string) {
  return frase.replace(/_{3,}/g, "___");
}

function converterUm(b: Bruto): ExercicioAutomatico | null {
  const base = { id: novoId(), titulo: t(b.titulo), instrucoes: t(b.instrucoes) };
  const itens = lista(b.itens) as Bruto[];
  switch (b.tipo) {
    case "lacuna":
      return {
        ...base,
        tipo: "lacuna",
        itens: itens.map((i) => ({
          id: novoId(),
          tipo: "lacuna",
          enunciado: normalizarLacuna(t(i.enunciado)),
          aceitas: textos(i.aceitas),
          errosPrevistos: (lista(i.errosPrevistos) as Bruto[]).map((e) => ({ valor: t(e.valor), explicacao: t(e.explicacao) })),
          explicacaoPadrao: t(i.explicacaoPadrao),
          grafiaExata: false,
        })),
      };
    case "multipla_escolha":
      return {
        ...base,
        tipo: "multipla_escolha",
        itens: itens.map((i) => ({
          id: novoId(),
          tipo: "multipla_escolha",
          enunciado: t(i.enunciado),
          alternativas: (lista(i.alternativas) as Bruto[]).map((a) => ({
            id: novoId(),
            texto: t(a.texto),
            correta: a.correta === true,
            explicacao: t(a.explicacao),
          })),
          explicacaoPadrao: t(i.explicacaoPadrao),
        })),
      };
    case "arrastar":
      return {
        ...base,
        tipo: "arrastar",
        palavrasExtras: textos(b.palavrasExtras),
        itens: itens.map((i) => ({
          id: novoId(),
          tipo: "arrastar",
          enunciado: normalizarLacuna(t(i.enunciado)),
          resposta: t(i.resposta),
          errosPrevistos: [],
          explicacaoPadrao: t(i.explicacaoPadrao),
        })),
      };
    case "classificar": {
      const colunas = [...new Set(textos(b.colunas).map((c) => c.trim()))].slice(0, 4).map((nome) => ({ id: novoId(), nome }));
      const idDa = (nome: string) =>
        colunas.find((c) => c.nome.toLocaleLowerCase() === nome.trim().toLocaleLowerCase())?.id ?? "";
      return {
        ...base,
        tipo: "classificar",
        colunas,
        itens: itens.map((i) => ({
          id: novoId(),
          tipo: "classificar",
          texto: t(i.texto),
          colunaId: idDa(t(i.coluna)),
          explicacao: t(i.explicacao),
        })),
      };
    }
    case "relacionar":
      return {
        ...base,
        tipo: "relacionar",
        itens: itens.map((i) => ({
          id: novoId(),
          tipo: "relacionar",
          esquerda: t(i.esquerda),
          direita: t(i.direita),
          explicacao: t(i.explicacao),
        })),
      };
    default:
      return null;
  }
}

/**
 * Transforma a resposta da IA em exercícios prontos para o editor.
 * Itens com defeito (sem lacuna, sem explicação, sem resposta certa...) são descartados,
 * e exercícios que ficam sem o mínimo de itens também.
 */
export function converterGeracao(bruto: unknown, tipos: TipoGeravel[]): { titulo: string; exercicios: Exercicio[] } {
  const b = (bruto && typeof bruto === "object" ? bruto : {}) as Bruto;
  const permitidos = new Set(tipos);
  const exercicios: Exercicio[] = [];
  for (const e of lista(b.exercicios) as Bruto[]) {
    if (!e || typeof e !== "object" || !permitidos.has(e.tipo as TipoGeravel)) continue;
    const convertido = converterUm(e);
    if (!convertido) continue;
    const limpo = limparExercicio(convertido) as ExercicioAutomatico;
    const bons = (limpo.itens as Exercicio["itens"]).filter((item) => problemasDoItem(limpo, item).length === 0);
    if (limpo.tipo === "relacionar") {
      // Lados repetidos deixariam o exercício ambíguo.
      const esq = new Set<string>();
      const dir = new Set<string>();
      const unicos = (bons as typeof limpo.itens).filter((p) => {
        const ok = !esq.has(p.esquerda.toLowerCase()) && !dir.has(p.direita.toLowerCase());
        esq.add(p.esquerda.toLowerCase());
        dir.add(p.direita.toLowerCase());
        return ok;
      });
      if (unicos.length >= 2) exercicios.push({ ...limpo, itens: unicos });
      continue;
    }
    if (limpo.tipo === "classificar" && (limpo.colunas.length < 2 || limpo.colunas.some((c) => !c.nome))) continue;
    if (bons.length === 0) continue;
    exercicios.push({ ...limpo, itens: bons } as Exercicio);
  }
  return { titulo: t(b.titulo).trim().slice(0, 200), exercicios };
}
