import type { Documento, No } from ".";

export type Cartao = { id: string; frente: string; verso: string };

const LIMITE_VERSO = 400;

const textoDe = (no: No): string =>
  no.type === "text" ? no.text : (no.content ?? []).map(textoDe).join(no.type === "bulletList" || no.type === "orderedList" ? "\n" : "");

const encurtar = (t: string) => {
  const limpo = t.replace(/[ \t]+/g, " ").replace(/\n{2,}/g, "\n").trim();
  return limpo.length > LIMITE_VERSO ? `${limpo.slice(0, LIMITE_VERSO - 1).trimEnd()}…` : limpo;
};

/**
 * Cartões de estudo montados do próprio resumo, sem IA:
 * - cada título ou subtítulo vira a frente, e o texto logo abaixo dele vira o verso;
 * - cada trecho em negrito vira a frente, e a frase (ou item de lista) em que ele está vira o verso.
 */
export function cartoesDoDocumento(doc: Documento): Cartao[] {
  const cartoes: Cartao[] = [];
  const frentes = new Set<string>();
  const adicionar = (frente: string, verso: string) => {
    const f = frente.trim().replace(/[:：]\s*$/, "");
    const v = encurtar(verso);
    const chave = f.toLowerCase();
    if (!f || !v || v.toLowerCase() === chave || frentes.has(chave)) return;
    frentes.add(chave);
    cartoes.push({ id: `c${cartoes.length + 1}`, frente: f, verso: v });
  };

  // Títulos: junta o que vem até o próximo título.
  let titulo: string | null = null;
  let corpo: string[] = [];
  const fecharTitulo = () => {
    if (titulo) adicionar(titulo, corpo.join("\n"));
    titulo = null;
    corpo = [];
  };
  for (const no of doc.content) {
    if (no.type === "heading") {
      fecharTitulo();
      titulo = textoDe(no);
    } else if (titulo && no.type !== "horizontalRule") {
      corpo.push(textoDe(no));
    }
  }
  fecharTitulo();

  // Negritos: o termo na frente e a frase dele no verso.
  const visitar = (no: No) => {
    if (no.type === "paragraph" || no.type === "listItem") {
      const filhos = no.content ?? [];
      const frase = textoDe(no);
      for (const f of filhos) {
        if (f.type === "text" && f.marks?.some((m) => m.type === "bold")) {
          const termo = f.text.trim();
          if (termo.length >= 2 && termo.length <= 80) adicionar(termo, frase);
        }
      }
      if (no.type === "listItem") filhos.forEach(visitar);
      return;
    }
    if (no.type !== "text") (no.content ?? []).forEach(visitar);
  };
  doc.content.forEach(visitar);

  return cartoes;
}
