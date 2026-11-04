import type { ItemArrastar, ItemClassificar, ItemLacuna, ItemMultiplaEscolha, ItemRelacionar } from "@/lib/correcao";

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
  arrastar: "Arrastar palavras",
  classificar: "Classificar em colunas",
  relacionar: "Relacionar",
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

export type ExercicioArrastar = {
  id: string;
  tipo: "arrastar";
  titulo: string;
  instrucoes: string;
  /** Palavras que entram no banco sem ser resposta de nenhum item, para despistar. */
  palavrasExtras: string[];
  itens: (ItemArrastar & { id: string })[];
};

export type Coluna = { id: string; nome: string };

export type ExercicioClassificar = {
  id: string;
  tipo: "classificar";
  titulo: string;
  instrucoes: string;
  colunas: Coluna[];
  itens: (ItemClassificar & { id: string })[];
};

export type ExercicioRelacionar = {
  id: string;
  tipo: "relacionar";
  titulo: string;
  instrucoes: string;
  itens: (ItemRelacionar & { id: string })[];
};

export type Exercicio =
  | ExercicioLacuna
  | ExercicioMultiplaEscolha
  | ExercicioArrastar
  | ExercicioClassificar
  | ExercicioRelacionar;

/** Campos do exercício que ficam na coluna "config" do banco, conforme o tipo. */
export function configDoExercicio(e: Exercicio): Record<string, unknown> {
  if (e.tipo === "arrastar") return { palavrasExtras: e.palavrasExtras };
  if (e.tipo === "classificar") return { colunas: e.colunas };
  return {};
}

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

export function novoItemArrastar(): ExercicioArrastar["itens"][number] {
  return { id: novoId(), tipo: "arrastar", enunciado: "", resposta: "", errosPrevistos: [], explicacaoPadrao: "" };
}

export function novoItemClassificar(colunaId = ""): ExercicioClassificar["itens"][number] {
  return { id: novoId(), tipo: "classificar", texto: "", colunaId, explicacao: "" };
}

export function novoItemRelacionar(): ExercicioRelacionar["itens"][number] {
  return { id: novoId(), tipo: "relacionar", esquerda: "", direita: "", explicacao: "" };
}

export function novoExercicio(tipo: TipoExercicio): Exercicio {
  const id = novoId();
  switch (tipo) {
    case "lacuna":
      return {
        id,
        tipo,
        titulo: "Complete as frases",
        instrucoes: "Escreva a palavra que falta e aperte Enter.",
        itens: [novoItemLacuna()],
      };
    case "multipla_escolha":
      return {
        id,
        tipo,
        titulo: "Escolha a resposta certa",
        instrucoes: "Clique na alternativa correta.",
        itens: [novoItemMultiplaEscolha()],
      };
    case "arrastar":
      return {
        id,
        tipo,
        titulo: "Complete com as palavras",
        instrucoes: "Arraste cada palavra para a lacuna certa, ou toque na palavra e depois na lacuna.",
        palavrasExtras: [],
        itens: [novoItemArrastar(), novoItemArrastar()],
      };
    case "classificar": {
      const colunas = [
        { id: novoId(), nome: "" },
        { id: novoId(), nome: "" },
      ];
      return {
        id,
        tipo,
        titulo: "Classifique",
        instrucoes: "Arraste cada cartão para a coluna certa, ou toque no cartão e depois na coluna.",
        colunas,
        itens: [novoItemClassificar(colunas[0].id), novoItemClassificar(colunas[1].id)],
      };
    }
    case "relacionar":
      return {
        id,
        tipo,
        titulo: "Relacione",
        instrucoes: "Toque num item da esquerda e depois no par dele à direita.",
        itens: [novoItemRelacionar(), novoItemRelacionar(), novoItemRelacionar()],
      };
  }
}

const limpar = (texto: string) => texto.trim();

/** Tira espaços sobrando e linhas vazias antes de salvar. */
export function limparExercicio(exercicio: Exercicio): Exercicio {
  const base = { id: exercicio.id, titulo: limpar(exercicio.titulo), instrucoes: limpar(exercicio.instrucoes) };
  const limparErros = (erros: { valor: string; explicacao: string }[]) =>
    erros.map((e) => ({ valor: limpar(e.valor), explicacao: limpar(e.explicacao) })).filter((e) => e.valor);

  switch (exercicio.tipo) {
    case "lacuna":
      return {
        ...base,
        tipo: "lacuna",
        itens: exercicio.itens.map((item) => ({
          id: item.id,
          tipo: "lacuna",
          enunciado: limpar(item.enunciado),
          aceitas: item.aceitas.map(limpar).filter(Boolean),
          errosPrevistos: limparErros(item.errosPrevistos),
          explicacaoPadrao: limpar(item.explicacaoPadrao),
          grafiaExata: Boolean(item.grafiaExata),
        })),
      };
    case "multipla_escolha":
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
    case "arrastar":
      return {
        ...base,
        tipo: "arrastar",
        palavrasExtras: exercicio.palavrasExtras.map(limpar).filter(Boolean),
        itens: exercicio.itens.map((item) => ({
          id: item.id,
          tipo: "arrastar",
          enunciado: limpar(item.enunciado),
          resposta: limpar(item.resposta),
          errosPrevistos: limparErros(item.errosPrevistos),
          explicacaoPadrao: limpar(item.explicacaoPadrao),
        })),
      };
    case "classificar":
      return {
        ...base,
        tipo: "classificar",
        colunas: exercicio.colunas.map((c) => ({ id: c.id, nome: limpar(c.nome) })),
        itens: exercicio.itens.map((item) => ({
          id: item.id,
          tipo: "classificar",
          texto: limpar(item.texto),
          colunaId: item.colunaId,
          explicacao: limpar(item.explicacao),
        })),
      };
    case "relacionar":
      return {
        ...base,
        tipo: "relacionar",
        itens: exercicio.itens.map((item) => ({
          id: item.id,
          tipo: "relacionar",
          esquerda: limpar(item.esquerda),
          direita: limpar(item.direita),
          explicacao: limpar(item.explicacao),
        })),
      };
  }
}

/** Problemas que impedem publicar. Lista vazia = pronto. Espera exercícios já limpos. */
export function problemasDaAtividade(titulo: string, exercicios: Exercicio[]): string[] {
  const problemas: string[] = [];
  if (!titulo.trim()) problemas.push("Dê um título para a atividade.");
  if (exercicios.length === 0) problemas.push("Adicione pelo menos um exercício.");

  exercicios.forEach((exercicio, i) => {
    const ex = `Exercício ${i + 1}`;
    if (exercicio.itens.length === 0) problemas.push(`${ex}: adicione pelo menos um item.`);
    if (exercicio.tipo === "classificar") {
      if (exercicio.colunas.length < 2) problemas.push(`${ex}: crie pelo menos duas colunas.`);
      if (exercicio.colunas.some((c) => !c.nome)) problemas.push(`${ex}: dê nome a todas as colunas.`);
    }
    if (exercicio.tipo === "relacionar" && exercicio.itens.length < 2) {
      problemas.push(`${ex}: crie pelo menos dois pares.`);
    }

    exercicio.itens.forEach((item, j) => {
      const onde = `${ex}, item ${j + 1}`;
      if (item.tipo === "arrastar") {
        if (item.enunciado.split(LACUNA).length - 1 !== 1) {
          problemas.push(`${onde}: a frase precisa ter exatamente uma lacuna (${LACUNA}).`);
        }
        if (!item.resposta) problemas.push(`${onde}: escreva a palavra certa.`);
        if (!item.explicacaoPadrao) problemas.push(`${onde}: escreva a explicação para quando o aluno errar.`);
        if (item.errosPrevistos.some((e) => !e.explicacao)) {
          problemas.push(`${onde}: todo erro previsto precisa de explicação.`);
        }
      } else if (item.tipo === "classificar") {
        if (!item.texto) problemas.push(`${onde}: escreva o texto do cartão.`);
        if (exercicio.tipo === "classificar" && !exercicio.colunas.some((c) => c.id === item.colunaId)) {
          problemas.push(`${onde}: escolha a coluna certa do cartão.`);
        }
        if (!item.explicacao) problemas.push(`${onde}: explique por que o cartão vai nessa coluna.`);
      } else if (item.tipo === "relacionar") {
        if (!item.esquerda || !item.direita) problemas.push(`${onde}: preencha os dois lados do par.`);
        if (!item.explicacao) problemas.push(`${onde}: escreva a explicação para quando o aluno errar o par.`);
      } else if (item.tipo === "lacuna") {
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
  if (!ehUuid(e.id) || !texto(e.titulo) || !texto(e.instrucoes)) return false;
  if (!Array.isArray(e.itens)) return false;
  const itens = e.itens as Record<string, unknown>[];
  const cada = (tipo: string, regra: (it: Record<string, unknown>) => boolean) =>
    itens.every((it) => it && typeof it === "object" && texto(it.id) && it.tipo === tipo && regra(it));

  switch (e.tipo) {
    case "lacuna":
      return cada(
        "lacuna",
        (it) => texto(it.enunciado) && listaDeTextos(it.aceitas) && errosValidos(it.errosPrevistos) && texto(it.explicacaoPadrao),
      );
    case "multipla_escolha":
      return cada(
        "multipla_escolha",
        (it) =>
          texto(it.enunciado) &&
          Array.isArray(it.alternativas) &&
          it.alternativas.every((a) => texto((a as AltLike)?.id) && texto((a as AltLike)?.texto)) &&
          texto(it.explicacaoPadrao),
      );
    case "arrastar":
      return (
        listaDeTextos(e.palavrasExtras) &&
        cada(
          "arrastar",
          (it) => texto(it.enunciado) && texto(it.resposta) && errosValidos(it.errosPrevistos) && texto(it.explicacaoPadrao),
        )
      );
    case "classificar":
      return (
        Array.isArray(e.colunas) &&
        e.colunas.every((c) => texto((c as AltLike)?.id) && texto((c as { nome?: unknown })?.nome)) &&
        cada("classificar", (it) => texto(it.texto) && texto(it.colunaId) && texto(it.explicacao))
      );
    case "relacionar":
      return cada("relacionar", (it) => texto(it.esquerda) && texto(it.direita) && texto(it.explicacao));
    default:
      return false;
  }
}

const texto = (v: unknown): v is string => typeof v === "string";
const listaDeTextos = (v: unknown) => Array.isArray(v) && v.every(texto);
const errosValidos = (v: unknown) =>
  Array.isArray(v) && v.every((x) => texto((x as ErroLike)?.valor) && texto((x as ErroLike)?.explicacao));

type ErroLike = { valor?: unknown; explicacao?: unknown };
type AltLike = { id?: unknown; texto?: unknown };
