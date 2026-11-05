import { nomeIdioma } from "../idiomas";
import { ehLinkDeArquivo, ehMidia, type Midia } from "./midia";
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

/** Etapa de ensino: vale para qualquer matéria, inclusive idiomas. Vazia = não informada. */
export const etapas = {
  infantil: "Educação Infantil",
  fundamental_1: "Fundamental I",
  fundamental_2: "Fundamental II",
  medio: "Ensino Médio",
  vestibular: "Enem e vestibular",
  superior: "Ensino Superior",
  concursos: "Concursos",
  livre: "Curso livre",
} as const;
export type Etapa = keyof typeof etapas;

export function ehEtapa(valor: unknown): valor is Etapa {
  return typeof valor === "string" && valor in etapas;
}

export const LIMITE_TEMAS = 8;
const TAMANHO_TEMA = 30;

/** "Frações, Porcentagem,  frações" vira ["frações", "porcentagem"]: minúsculas, sem repetir, até 8. */
export function normalizarTemas(entrada: string | readonly string[]): string[] {
  const partes = typeof entrada === "string" ? entrada.split(/[,;\n]/) : entrada;
  const temas: string[] = [];
  for (const parte of partes) {
    if (typeof parte !== "string") continue;
    const tema = parte.replace(/\s+/g, " ").trim().replace(/^#+\s*/, "").toLowerCase().slice(0, TAMANHO_TEMA).trim();
    if (tema && !temas.includes(tema)) temas.push(tema);
    if (temas.length === LIMITE_TEMAS) break;
  }
  return temas;
}

export const tiposExercicio = {
  lacuna: "Completar lacunas",
  multipla_escolha: "Múltipla escolha",
  arrastar: "Arrastar palavras",
  classificar: "Classificar em colunas",
  relacionar: "Relacionar",
  producao: "Produção escrita ou oral",
  kahoot: "Kahoot",
} as const;
export type TipoExercicio = keyof typeof tiposExercicio;

/** Marca da lacuna dentro do enunciado. */
export const LACUNA = "___";

export type ExercicioLacuna = {
  id: string;
  tipo: "lacuna";
  titulo: string;
  instrucoes: string;
  /** Imagem, áudio ou vídeo mostrado no topo do exercício. */
  midia?: Midia;
  itens: (ItemLacuna & { id: string })[];
};

export type ExercicioMultiplaEscolha = {
  id: string;
  tipo: "multipla_escolha";
  titulo: string;
  instrucoes: string;
  /** Imagem, áudio ou vídeo mostrado no topo do exercício. */
  midia?: Midia;
  itens: (ItemMultiplaEscolha & { id: string })[];
};

export type ExercicioArrastar = {
  id: string;
  tipo: "arrastar";
  titulo: string;
  instrucoes: string;
  /** Imagem, áudio ou vídeo mostrado no topo do exercício. */
  midia?: Midia;
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
  /** Imagem, áudio ou vídeo mostrado no topo do exercício. */
  midia?: Midia;
  colunas: Coluna[];
  itens: (ItemClassificar & { id: string })[];
};

export type ExercicioRelacionar = {
  id: string;
  tipo: "relacionar";
  titulo: string;
  instrucoes: string;
  /** Imagem, áudio ou vídeo mostrado no topo do exercício. */
  midia?: Midia;
  itens: (ItemRelacionar & { id: string })[];
};

/** Resposta aberta, escrita ou gravada, que o professor corrige e comenta. */
export type ItemProducao = {
  id: string;
  tipo: "producao";
  enunciado: string;
  modo: "escrita" | "oral";
  /** O que o professor espera (só o professor vê; ajuda na correção). */
  orientacao: string;
};

export type ExercicioProducao = {
  id: string;
  tipo: "producao";
  titulo: string;
  instrucoes: string;
  /** Imagem, áudio ou vídeo mostrado no topo do exercício. */
  midia?: Midia;
  itens: ItemProducao[];
};

/** Link para um Kahoot. Não tem itens: o jogo acontece no site do Kahoot. */
export type ExercicioKahoot = {
  id: string;
  tipo: "kahoot";
  titulo: string;
  instrucoes: string;
  /** Imagem, áudio ou vídeo mostrado no topo do exercício. */
  midia?: Midia;
  link: string;
  itens: never[];
};

export type Exercicio =
  | ExercicioLacuna
  | ExercicioMultiplaEscolha
  | ExercicioArrastar
  | ExercicioClassificar
  | ExercicioRelacionar
  | ExercicioProducao
  | ExercicioKahoot;

/** Exercícios que o Repasa corrige na hora (entram na contagem de acertos). */
export type ExercicioAutomatico = Exclude<Exercicio, ExercicioProducao | ExercicioKahoot>;

export function ehAutomatico(e: Exercicio): e is ExercicioAutomatico {
  return e.tipo !== "producao" && e.tipo !== "kahoot";
}

/** Só links do Kahoot (kahoot.it, create.kahoot.it, kahoot.com), em https. */
export function ehLinkKahoot(link: string): boolean {
  try {
    const url = new URL(link.trim());
    const host = url.hostname;
    const doKahoot = ["kahoot.it", "kahoot.com"].some((d) => host === d || host.endsWith(`.${d}`));
    return url.protocol === "https:" && doKahoot && link.length <= 2000;
  } catch {
    return false;
  }
}

/** Campos do exercício que ficam na coluna "config" do banco, conforme o tipo. */
export function configDoExercicio(e: Exercicio): Record<string, unknown> {
  const config: Record<string, unknown> = e.midia ? { midia: e.midia } : {};
  if (e.tipo === "arrastar") config.palavrasExtras = e.palavrasExtras;
  if (e.tipo === "classificar") config.colunas = e.colunas;
  if (e.tipo === "kahoot") config.link = e.link;
  return config;
}

export type Atividade = {
  id: string;
  titulo: string;
  /** Nível e tema só valem para atividades de idioma. */
  nivel: Nivel;
  categoria: Categoria;
  /** Preenchida nas atividades de outras matérias; vazia nas de idioma. */
  materia: string;
  idioma_ensinado: string | null;
  idioma_instrucao: string | null;
  explicacao: string;
  publicada: boolean;
  publica: boolean;
  /** "Entregar até" (AAAA-MM-DD), opcional. */
  prazo?: string | null;
  /** Etapa de ensino (qualquer matéria); vazia quando o professor não informou. */
  etapa: Etapa | "";
  /** Assuntos livres, em minúsculas, para achar a atividade na biblioteca. */
  temas: string[];
};

/** Etiquetas curtas da atividade: "A2 · Gramática · Espanhol" ou "Matemática · Fundamental II". */
export function etiquetasDaAtividade(
  a: { materia?: string | null; nivel: string; categoria: string; idioma_ensinado?: string | null; etapa?: string | null },
): string[] {
  const etapa = ehEtapa(a.etapa) ? [etapas[a.etapa]] : [];
  const materia = a.materia?.trim();
  if (materia) return [materia, ...etapa];
  const tema = categorias[a.categoria as Categoria] ?? a.categoria;
  return [a.nivel, tema, ...(a.idioma_ensinado ? [nomeIdioma(a.idioma_ensinado)] : []), ...etapa];
}

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

export function novoItemProducao(modo: ItemProducao["modo"] = "escrita"): ItemProducao {
  return { id: novoId(), tipo: "producao", enunciado: "", modo, orientacao: "" };
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
    case "producao":
      return {
        id,
        tipo,
        titulo: "Produção",
        instrucoes: "Responda com suas palavras. O professor vai ler, corrigir e comentar.",
        itens: [novoItemProducao("escrita")],
      };
    case "kahoot":
      return { id, tipo, titulo: "Kahoot", instrucoes: "Abra o Kahoot e jogue.", link: "", itens: [] };
  }
}

const limpar = (texto: string) => texto.trim();
const dicaLimpa = (dica: unknown) => (typeof dica === "string" && dica.trim() ? { dica: dica.trim().slice(0, 300) } : {});

/** Mídia sem link vira "sem mídia"; legenda vazia some. */
function limparMidia(midia: Midia | undefined): Midia | undefined {
  if (!midia || !midia.url.trim()) return undefined;
  const legenda = midia.legenda?.trim();
  return { tipo: midia.tipo, url: midia.url.trim(), ...(legenda ? { legenda } : {}) };
}

/** Tira espaços sobrando e linhas vazias antes de salvar. */
export function limparExercicio(exercicio: Exercicio): Exercicio {
  const midia = limparMidia(exercicio.midia);
  const base = {
    id: exercicio.id,
    titulo: limpar(exercicio.titulo),
    instrucoes: limpar(exercicio.instrucoes),
    ...(midia ? { midia } : {}),
  };
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
          ...dicaLimpa(item.dica),
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
          ...dicaLimpa(item.dica),
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
          ...dicaLimpa(item.dica),
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
          ...(item.imagem?.trim() ? { imagem: item.imagem.trim() } : {}),
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
    case "producao":
      return {
        ...base,
        tipo: "producao",
        itens: exercicio.itens.map((item) => ({
          id: item.id,
          tipo: "producao",
          enunciado: limpar(item.enunciado),
          modo: item.modo === "oral" ? "oral" : "escrita",
          orientacao: limpar(item.orientacao),
        })),
      };
    case "kahoot":
      return { ...base, tipo: "kahoot", link: limpar(exercicio.link), itens: [] };
  }
}

/** Problemas de um item (sem dizer onde ele está). Lista vazia = item pronto. */
export function problemasDoItem(exercicio: Exercicio, item: Exercicio["itens"][number]): string[] {
  const p: string[] = [];
  if (item.tipo === "arrastar") {
    if (item.enunciado.split(LACUNA).length - 1 !== 1) {
      p.push(`a frase precisa ter exatamente uma lacuna (${LACUNA}).`);
    }
    if (!item.resposta) p.push(`escreva a palavra certa.`);
    if (!item.explicacaoPadrao) p.push(`escreva a explicação para quando o aluno errar.`);
    if (item.errosPrevistos.some((e) => !e.explicacao)) {
      p.push(`todo erro previsto precisa de explicação.`);
    }
  } else if (item.tipo === "classificar") {
    if (!item.texto) p.push(`escreva o texto do cartão.`);
    if (exercicio.tipo === "classificar" && !exercicio.colunas.some((c) => c.id === item.colunaId)) {
      p.push(`escolha a coluna certa do cartão.`);
    }
    if (!item.explicacao) p.push(`explique por que o cartão vai nessa coluna.`);
  } else if (item.tipo === "producao") {
    if (!item.enunciado) p.push(`escreva o que o aluno deve produzir.`);
  } else if (item.tipo === "relacionar") {
    if (!item.esquerda || !item.direita) p.push(`preencha os dois lados do par.`);
    if (!item.explicacao) p.push(`escreva a explicação para quando o aluno errar o par.`);
  } else if (item.tipo === "lacuna") {
    const lacunas = item.enunciado.split(LACUNA).length - 1;
    if (lacunas !== 1) p.push(`a frase precisa ter exatamente uma lacuna (${LACUNA}).`);
    if (item.aceitas.length === 0) p.push(`escreva a resposta certa.`);
    if (!item.explicacaoPadrao) p.push(`escreva a explicação para quando o aluno errar.`);
    if (item.errosPrevistos.some((e) => !e.explicacao)) {
      p.push(`todo erro previsto precisa de explicação.`);
    }
  } else {
    if (!item.enunciado) p.push(`escreva a pergunta.`);
    if (item.alternativas.length < 2) p.push(`precisa de pelo menos duas alternativas.`);
    if (item.alternativas.filter((a) => a.correta).length !== 1) {
      p.push(`marque exatamente uma alternativa correta.`);
    }
    const erradasSemExplicacao = item.alternativas.some((a) => !a.correta && !a.explicacao);
    if (erradasSemExplicacao && !item.explicacaoPadrao) {
      p.push(`explique as alternativas erradas ou escreva uma explicação geral.`);
    }
  }
  return p;
}

/** Problemas que impedem publicar. Lista vazia = pronto. Espera exercícios já limpos. */
export function problemasDaAtividade(titulo: string, exercicios: Exercicio[]): string[] {
  const problemas: string[] = [];
  if (!titulo.trim()) problemas.push("Dê um título para a atividade.");
  if (exercicios.length === 0) problemas.push("Adicione pelo menos um exercício.");

  exercicios.forEach((exercicio, i) => {
    const ex = `Exercício ${i + 1}`;
    if (exercicio.tipo === "kahoot") {
      if (!ehLinkKahoot(exercicio.link)) problemas.push(`${ex}: cole o link do Kahoot (kahoot.it).`);
    } else if (exercicio.itens.length === 0) {
      problemas.push(`${ex}: adicione pelo menos um item.`);
    }
    const midia: Midia | undefined = exercicio.midia;
    if (midia && !ehMidia(midia)) {
      problemas.push(
        (midia as Midia).tipo === "video"
          ? `${ex}: o vídeo precisa ser um link do YouTube ou do Vimeo.`
          : `${ex}: o link da mídia precisa começar com https://.`,
      );
    }
    if (exercicio.tipo === "classificar") {
      if (exercicio.colunas.length < 2) problemas.push(`${ex}: crie pelo menos duas colunas.`);
      if (exercicio.colunas.some((c) => !c.nome)) problemas.push(`${ex}: dê nome a todas as colunas.`);
    }
    if (exercicio.tipo === "relacionar" && exercicio.itens.length < 2) {
      problemas.push(`${ex}: crie pelo menos dois pares.`);
    }

    exercicio.itens.forEach((item, j) => {
      for (const p of problemasDoItem(exercicio, item)) problemas.push(`${ex}, item ${j + 1}: ${p}`);
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
  if (e.midia !== undefined && !midiaRascunho(e.midia)) return false;
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
        cada(
          "classificar",
          (it) =>
            texto(it.texto) &&
            texto(it.colunaId) &&
            texto(it.explicacao) &&
            (it.imagem === undefined || ehLinkDeArquivo(it.imagem)),
        )
      );
    case "relacionar":
      return cada("relacionar", (it) => texto(it.esquerda) && texto(it.direita) && texto(it.explicacao));
    case "producao":
      return cada(
        "producao",
        (it) => texto(it.enunciado) && (it.modo === "escrita" || it.modo === "oral") && texto(it.orientacao),
      );
    case "kahoot":
      return texto(e.link) && e.link.length <= 2000 && itens.length === 0;
    default:
      return false;
  }
}

const texto = (v: unknown): v is string => typeof v === "string";
/** Forma da mídia num rascunho: o link pode estar errado (aí não publica), mas tem de ser texto curto. */
const midiaRascunho = (v: unknown) => {
  const m = v as Record<string, unknown> | null;
  return (
    !!m &&
    typeof m === "object" &&
    (m.tipo === "imagem" || m.tipo === "audio" || m.tipo === "video") &&
    texto(m.url) &&
    m.url.length <= 2000 &&
    (m.legenda === undefined || (texto(m.legenda) && m.legenda.length <= 300))
  );
};
const listaDeTextos = (v: unknown) => Array.isArray(v) && v.every(texto);
const errosValidos = (v: unknown) =>
  Array.isArray(v) && v.every((x) => texto((x as ErroLike)?.valor) && texto((x as ErroLike)?.explicacao));

type ErroLike = { valor?: unknown; explicacao?: unknown };
type AltLike = { id?: unknown; texto?: unknown };
