// Documento do resumo: o JSON do editor (formato TipTap), limitado ao que a Repasa sabe mostrar.

export type Marca = { type: "bold" | "italic" | "highlight" };
export type NoTexto = { type: "text"; text: string; marks?: Marca[] };
export type NoBloco = {
  type: "paragraph" | "heading" | "bulletList" | "orderedList" | "listItem" | "blockquote" | "hardBreak" | "horizontalRule";
  attrs?: { level: 2 | 3 };
  content?: No[];
};
export type No = NoTexto | NoBloco;
export type Documento = { type: "doc"; content: No[] };

export const LIMITE_CARACTERES = 20000;

const blocos = new Set(["paragraph", "heading", "bulletList", "orderedList", "listItem", "blockquote", "hardBreak", "horizontalRule"]);
const marcas = new Set(["bold", "italic", "highlight"]);

export const documentoVazio = (): Documento => ({ type: "doc", content: [{ type: "paragraph" }] });

/** Mantém só nós e marcas conhecidos. Devolve null se não for um documento. */
export function validarDocumento(entrada: unknown): Documento | null {
  if (!entrada || typeof entrada !== "object" || (entrada as { type?: unknown }).type !== "doc") return null;
  let restante = LIMITE_CARACTERES;

  const limpar = (no: unknown, profundidade: number): No | null => {
    if (!no || typeof no !== "object" || profundidade > 8) return null;
    const n = no as { type?: unknown; text?: unknown; marks?: unknown; attrs?: { level?: unknown }; content?: unknown };
    if (n.type === "text") {
      if (typeof n.text !== "string" || !n.text || restante <= 0) return null;
      const text = n.text.slice(0, restante);
      restante -= text.length;
      const ms = Array.isArray(n.marks)
        ? n.marks.flatMap((m) => (m && marcas.has((m as Marca).type) ? [{ type: (m as Marca).type }] : []))
        : [];
      return ms.length ? { type: "text", text, marks: ms } : { type: "text", text };
    }
    if (typeof n.type !== "string" || !blocos.has(n.type)) return null;
    const bloco: NoBloco = { type: n.type as NoBloco["type"] };
    if (n.type === "heading") bloco.attrs = { level: n.attrs?.level === 3 ? 3 : 2 };
    if (Array.isArray(n.content)) {
      const filhos = n.content.flatMap((f) => limpar(f, profundidade + 1) ?? []);
      if (filhos.length) bloco.content = filhos;
    }
    return bloco;
  };

  const content = Array.isArray((entrada as { content?: unknown }).content)
    ? ((entrada as { content: unknown[] }).content.flatMap((n) => limpar(n, 0) ?? []) as No[])
    : [];
  return { type: "doc", content };
}

/** Texto corrido do documento (para buscas e para quem ainda lê o campo antigo). */
export function textoDoDocumento(doc: Documento): string {
  const linhas: string[] = [];
  const andar = (no: No): string => {
    if (no.type === "text") return no.text;
    if (no.type === "hardBreak") return "\n";
    return (no.content ?? []).map(andar).join("");
  };
  const blocosDe = (lista: No[]) => {
    for (const no of lista) {
      if (no.type === "bulletList" || no.type === "orderedList" || no.type === "blockquote" || no.type === "listItem") {
        blocosDe(no.content ?? []);
      } else {
        const t = andar(no).trim();
        if (t) linhas.push(t);
      }
    }
  };
  blocosDe(doc.content);
  return linhas.join("\n");
}

/** Converte o resumo antigo (texto puro) em documento: uma linha, um parágrafo. */
export function documentoDeTexto(texto: string): Documento {
  const linhas = texto.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!linhas.length) return documentoVazio();
  return { type: "doc", content: linhas.map((l) => ({ type: "paragraph", content: [{ type: "text", text: l }] })) };
}

export type Secao = { id: string; texto: string; nivel: 2 | 3 };

/** Id estável para o título de uma seção (âncora do sumário). */
export function idSecao(texto: string, indice: number) {
  const base = texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `secao-${indice + 1}${base ? `-${base}` : ""}`;
}

/** Títulos e subtítulos, na ordem, para montar o sumário. */
export function secoesDoDocumento(doc: Documento): Secao[] {
  const secoes: Secao[] = [];
  doc.content.forEach((no) => {
    if (no.type !== "heading") return;
    const texto = (no.content ?? []).map((f) => (f.type === "text" ? f.text : "")).join("").trim();
    if (texto) secoes.push({ id: idSecao(texto, secoes.length), texto, nivel: no.attrs?.level ?? 2 });
  });
  return secoes;
}

export function documentoTemConteudo(doc: Documento | null): doc is Documento {
  return !!doc && (textoDoDocumento(doc).length > 0 || doc.content.some((n) => n.type === "horizontalRule"));
}
