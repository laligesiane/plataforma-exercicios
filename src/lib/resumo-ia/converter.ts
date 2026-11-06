// Forma que pedimos à IA para o resumo e a conversão para o documento do editor.
// A IA devolve blocos simples (título, parágrafo, lista, nota) com **negrito** e ==marca-texto== no texto,
// e a Repasa monta o documento. Assim o resultado sempre abre no editor do jeito certo.

import { validarDocumento, type Documento, type Marca, type No, type NoTexto } from "../documento";

export const TAMANHOS = {
  curto: { nome: "Curto", dica: "Só o essencial", alvo: "curto e direto: só as ideias principais, cabendo em uma página (até umas 350 palavras)" },
  medio: { nome: "Médio", dica: "O mais usado", alvo: "de tamanho médio: as ideias principais com os detalhes que ajudam a entender (umas 600 a 900 palavras)" },
  detalhado: { nome: "Detalhado", dica: "Para revisar tudo", alvo: "detalhado: cobre todos os tópicos do material, com exemplos quando ajudarem (até umas 1800 palavras)" },
} as const;
export type Tamanho = keyof typeof TAMANHOS;

export function ehTamanho(v: unknown): v is Tamanho {
  return typeof v === "string" && v in TAMANHOS;
}

export type Bloco = {
  tipo: "titulo" | "subtitulo" | "paragrafo" | "lista" | "lista_numerada" | "nota";
  texto: string;
  itens: string[];
};

const textoSchema = { type: "string" } as const;

export const esquemaResumo = {
  type: "object",
  properties: {
    titulo: textoSchema,
    blocos: {
      type: "array",
      items: {
        type: "object",
        properties: {
          tipo: { type: "string", enum: ["titulo", "subtitulo", "paragrafo", "lista", "lista_numerada", "nota"] },
          texto: textoSchema,
          itens: { type: "array", items: textoSchema },
        },
        required: ["tipo", "texto", "itens"],
        additionalProperties: false,
      },
    },
  },
  required: ["titulo", "blocos"],
  additionalProperties: false,
} as const;

/** Lê **negrito**, ==marca-texto== e *itálico* (só esses) e devolve os pedaços de texto com as marcas. */
export function textoComMarcas(entrada: string): NoTexto[] {
  const nos: NoTexto[] = [];
  const re = /\*\*(.+?)\*\*|==(.+?)==|(?<![\w*])\*(?!\s)([^*\n]+?)\*(?![\w*])/g;
  let ultimo = 0;
  const empurrar = (text: string, marca?: Marca["type"]) => {
    if (!text) return;
    nos.push(marca ? { type: "text", text, marks: [{ type: marca }] } : { type: "text", text });
  };
  for (const m of entrada.matchAll(re)) {
    empurrar(entrada.slice(ultimo, m.index));
    if (m[1] !== undefined) empurrar(m[1], "bold");
    else if (m[2] !== undefined) empurrar(m[2], "highlight");
    else empurrar(m[3], "italic");
    ultimo = m.index! + m[0].length;
  }
  empurrar(entrada.slice(ultimo));
  return nos;
}

const limparLinha = (t: unknown) =>
  typeof t === "string" ? t.replace(/\s+/g, " ").replace(/^#+\s*/, "").trim() : "";

function paragrafo(texto: string): No {
  const content = textoComMarcas(texto);
  return content.length ? { type: "paragraph", content } : { type: "paragraph" };
}

/** Título sem marcas (o negrito já vem do próprio título). */
const semMarcas = (t: string) => t.replace(/\*\*|==/g, "");

export function blocosParaDocumento(blocos: unknown): Documento | null {
  if (!Array.isArray(blocos)) return null;
  const content: No[] = [];
  for (const b of blocos as Partial<Bloco>[]) {
    if (!b || typeof b !== "object") continue;
    const texto = limparLinha(b.texto);
    const itens = Array.isArray(b.itens)
      ? b.itens.map((i) => limparLinha(i).replace(/^([-*•]|\d+[.)])\s+/, "")).filter(Boolean)
      : [];
    switch (b.tipo) {
      case "titulo":
      case "subtitulo":
        if (texto) {
          content.push({
            type: "heading",
            attrs: { level: b.tipo === "titulo" ? 2 : 3 },
            content: [{ type: "text", text: semMarcas(texto) }],
          });
        }
        break;
      case "lista":
      case "lista_numerada": {
        if (texto) content.push(paragrafo(texto));
        if (itens.length) {
          content.push({
            type: b.tipo === "lista" ? "bulletList" : "orderedList",
            content: itens.map((i) => ({ type: "listItem", content: [paragrafo(i)] })),
          });
        }
        break;
      }
      case "nota": {
        const linhas = [texto, ...itens].filter(Boolean);
        if (linhas.length) content.push({ type: "blockquote", content: linhas.map(paragrafo) });
        break;
      }
      default:
        if (texto) content.push(paragrafo(texto));
        for (const i of itens) content.push(paragrafo(i));
    }
  }
  const doc = validarDocumento({ type: "doc", content });
  return doc && doc.content.length ? doc : null;
}
