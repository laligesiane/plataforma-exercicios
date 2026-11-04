import type { ItemLacuna, ItemMultiplaEscolha } from "@/lib/correcao";

export const niveis = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type Nivel = (typeof niveis)[number];

export const categorias = {
  gramatica: "Gramática",
  vocabulario: "Vocabulário",
  funcoes: "Funções comunicativas",
  ortografia: "Ortografia",
  cultura: "Cultura",
} as const;
export type Categoria = keyof typeof categorias;

export const tiposExercicio = {
  lacuna: "Completar lacunas",
  multipla_escolha: "Múltipla escolha",
} as const;
export type TipoExercicio = keyof typeof tiposExercicio;

/** Marca da lacuna dentro do enunciado. */
export const LACUNA = "___";

export type ExercicioLacuna = {
  id: string;
  tipo: "lacuna";
  titulo: string;
  instrucoes: string;
  itens: (ItemLacuna & { id: string })[];
};

export type ExercicioMultiplaEscolha = {
  id: string;
  tipo: "multipla_escolha";
  titulo: string;
  instrucoes: string;
  itens: (ItemMultiplaEscolha & { id: string })[];
};

export type Exercicio = ExercicioLacuna | ExercicioMultiplaEscolha;

export type Atividade = {
  id: string;
  titulo: string;
  nivel: Nivel;
  categoria: Categoria;
  idioma_ensinado: string;
  idioma_instrucao: string;
  explicacao: string;
  publicada: boolean;
  publica: boolean;
};

const formatoUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function ehUuid(valor: unknown): valor is string {
  return typeof valor === "string" && formatoUuid.test(valor);
}

export function novoId() {
  return crypto.randomUUID();
}

export function novoItemLacuna(): ExercicioLacuna["itens"][number] {
  return {
    id: novoId(),
    tipo: "lacuna",
    enunciado: "",
    aceitas: [""],
    errosPrevistos: [],
    explicacaoPadrao: "",
    grafiaExata: false,
  };
}

export function novoItemMultiplaEscolha(): ExercicioMultiplaEscolha["itens"][number] {
  return {
    id: novoId(),
    tipo: "multipla_escolha",
    enunciado: "",
    alternativas: [
      { id: novoId(), texto: "", correta: true },
      { id: novoId(), texto: "", correta: false },
    ],
    explicacaoPadrao: "",
  };
}

export function novoExercicio(tipo: TipoExercicio): Exercicio {
  if (tipo === "lacuna") {
    return {
      id: novoId(),
      tipo,
      titulo: "Complete as frases",
      instrucoes: "Escreva a palavra que falta e aperte Enter.",
      itens: [novoItemLacuna()],
    };
  }
  return {
    id: novoId(),
    tipo,
    titulo: "Escolha a resposta certa",
    instrucoes: "Clique na alternativa correta.",
    itens: [novoItemMultiplaEscolha()],
  };
}

const limpar = (texto: string) => texto.trim();

/** Tira espaços sobrando e linhas vazias antes de salvar. */
export function limparExercicio(exercicio: Exercicio): Exercicio {
  const base = { id: exercicio.id, titulo: limpar(exercicio.titulo), instrucoes: limpar(exercicio.instrucoes) };
  if (exercicio.tipo === "lacuna") {
    return {
      ...base,
      tipo: "lacuna",
      itens: exercicio.itens.map((item) => ({
        id: item.id,
        tipo: "lacuna",
        enunciado: limpar(item.enunciado),
        aceitas: item.aceitas.map(limpar).filter(Boolean),
        errosPrevistos: item.errosPrevistos
          .map((e) => ({ valor: limpar(e.valor), explicacao: limpar(e.explicacao) }))
          .filter((e) => e.valor),
        explicacaoPadrao: limpar(item.explicacaoPadrao),
        grafiaExata: Boolean(item.grafiaExata),
      })),
    };
  }
  return {
    ...base,
    tipo: "multipla_escolha",
    itens: exercicio.itens.map((item) => ({
      id: item.id,
      tipo: "multipla_escolha",
      enunciado: limpar(item.enunciado),
      alternativas: item.alternativas
        .map((a) => ({
          id: a.id,
          texto: limpar(a.texto),
          correta: Boolean(a.correta),
          ...(a.explicacao?.trim() ? { explicacao: limpar(a.explicacao) } : {}),
        }))
        .filter((a) => a.texto),
      explicacaoPadrao: limpar(item.explicacaoPadrao),
    })),
  };
}

/** Problemas que impedem publicar. Lista vazia = pronto. Espera exercícios já limpos. */
export function problemasDaAtividade(titulo: string, exercicios: Exercicio[]): string[] {
  const problemas: string[] = [];
  if (!titulo.trim()) problemas.push("Dê um título para a atividade.");
  if (exercicios.length === 0) problemas.push("Adicione pelo menos um exercício.");

  exercicios.forEach((exercicio, i) => {
    const ex = `Exercício ${i + 1}`;
    if (exercicio.itens.length === 0) problemas.push(`${ex}: adicione pelo menos um item.`);

    exercicio.itens.forEach((item, j) => {
      const onde = `${ex}, item ${j + 1}`;
      if (item.tipo === "lacuna") {
        const lacunas = item.enunciado.split(LACUNA).length - 1;
        if (lacunas !== 1) problemas.push(`${onde}: a frase precisa ter exatamente uma lacuna (${LACUNA}).`);
        if (item.aceitas.length === 0) problemas.push(`${onde}: escreva a resposta certa.`);
        if (!item.explicacaoPadrao) problemas.push(`${onde}: escreva a explicação para quando o aluno errar.`);
        if (item.errosPrevistos.some((e) => !e.explicacao)) {
          problemas.push(`${onde}: todo erro previsto precisa de explicação.`);
        }
      } else {
        if (!item.enunciado) problemas.push(`${onde}: escreva a pergunta.`);
        if (item.alternativas.length < 2) problemas.push(`${onde}: precisa de pelo menos duas alternativas.`);
        if (item.alternativas.filter((a) => a.correta).length !== 1) {
          problemas.push(`${onde}: marque exatamente uma alternativa correta.`);
        }
        const erradasSemExplicacao = item.alternativas.some((a) => !a.correta && !a.explicacao);
        if (erradasSemExplicacao && !item.explicacaoPadrao) {
          problemas.push(`${onde}: explique as alternativas erradas ou escreva uma explicação geral.`);
        }
      }
    });
  });

  return problemas;
}

/** Confere a forma do JSON que chega do navegador antes de gravar. */
export function ehExercicio(valor: unknown): valor is Exercicio {
  if (!valor || typeof valor !== "object") return false;
  const e = valor as Record<string, unknown>;
  if (!ehUuid(e.id) || typeof e.titulo !== "string" || typeof e.instrucoes !== "string") return false;
  if (!Array.isArray(e.itens)) return false;
  if (e.tipo === "lacuna") {
    return e.itens.every((i) => {
      const it = i as Record<string, unknown>;
      return (
        typeof it?.id === "string" &&
        it.tipo === "lacuna" &&
        typeof it.enunciado === "string" &&
        Array.isArray(it.aceitas) &&
        it.aceitas.every((a) => typeof a === "string") &&
        Array.isArray(it.errosPrevistos) &&
        it.errosPrevistos.every(
          (x) => typeof (x as ErroLike)?.valor === "string" && typeof (x as ErroLike)?.explicacao === "string",
        ) &&
        typeof it.explicacaoPadrao === "string"
      );
    });
  }
  if (e.tipo === "multipla_escolha") {
    return e.itens.every((i) => {
      const it = i as Record<string, unknown>;
      return (
        typeof it?.id === "string" &&
        it.tipo === "multipla_escolha" &&
        typeof it.enunciado === "string" &&
        Array.isArray(it.alternativas) &&
        it.alternativas.every((a) => typeof (a as AltLike)?.id === "string" && typeof (a as AltLike)?.texto === "string") &&
        typeof it.explicacaoPadrao === "string"
      );
    });
  }
  return false;
}

type ErroLike = { valor?: unknown; explicacao?: unknown };
type AltLike = { id?: unknown; texto?: unknown };
