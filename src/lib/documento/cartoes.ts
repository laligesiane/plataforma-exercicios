import type { Documento, No } from ".";

/** "titulo": veio de um título e do texto embaixo dele. "negrito": veio de um trecho em negrito e da frase dele. */
export type Cartao = { id: string; frente: string; verso: string; tipo: "titulo" | "negrito" };

/** Quantos cartões entram numa rodada, para o estudo não ficar maçante. */
export const CARTOES_POR_RODADA = 10;

const LIMITE_VERSO = 400;

const textoDe = (no: No): string =>
  no.type === "text" ? no.text : (no.content ?? []).map(textoDe).join(no.type === "bulletList" || no.type === "orderedList" ? "\n" : "");

/** Limpa os espaços e, se passar do limite, corta no fim de uma frase, para não ficar frase pela metade. */
const encurtar = (t: string) => {
  const limpo = t.replace(/[ \t]+/g, " ").replace(/\n{2,}/g, "\n").trim();
  if (limpo.length <= LIMITE_VERSO) return limpo;
  const corte = limpo.slice(0, LIMITE_VERSO);
  const fim = Math.max(...[". ", "! ", "? ", ".\n", "!\n", "?\n", "\n"].map((s) => corte.lastIndexOf(s)));
  return fim > 0 ? corte.slice(0, fim + 1).trim() : `${corte.slice(0, LIMITE_VERSO - 1).trimEnd()}…`;
};

/**
 * Cartões de estudo montados do próprio resumo, sem IA:
 * - cada título ou subtítulo vira a frente, e o texto logo abaixo dele vira o verso;
 * - cada trecho em negrito vira a frente, e a frase (ou item de lista) em que ele está vira o verso.
 */
export function cartoesDoDocumento(doc: Documento): Cartao[] {
  const cartoes: Cartao[] = [];
  const frentes = new Set<string>();
  const adicionar = (frente: string, verso: string, tipo: Cartao["tipo"]) => {
    // Tira a numeração dos títulos ("2. Indução", "II - Indução") e os dois-pontos do fim.
    const f = frente
      .trim()
      .replace(/^(\d+(\.\d+)*|[IVX]{1,4})\s*[.)\-–]\s+/, "")
      .replace(/[:：]\s*$/, "");
    const v = encurtar(verso);
    const chave = f.toLowerCase();
    if (!f || !v || v.toLowerCase() === chave || frentes.has(chave)) return;
    frentes.add(chave);
    cartoes.push({ id: `c${cartoes.length + 1}`, frente: f, verso: v, tipo });
  };

  // Títulos: junta o que vem até o próximo título.
  let titulo: string | null = null;
  let corpo: string[] = [];
  const fecharTitulo = () => {
    if (titulo) adicionar(titulo, corpo.join("\n"), "titulo");
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
          if (termo.length >= 2 && termo.length <= 80) adicionar(termo, frase, "negrito");
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

/**
 * Os cartões de uma rodada: no máximo 10, misturando títulos e negritos para variar.
 * A rodada 0 pega os primeiros; as seguintes vão andando pela lista e dão a volta,
 * para quem estuda de novo ver cartões que ainda não viu.
 */
export function rodadaDeCartoes(cartoes: Cartao[], rodada = 0, maximo = CARTOES_POR_RODADA): Cartao[] {
  if (cartoes.length <= maximo) return cartoes;
  const titulos = cartoes.filter((c) => c.tipo === "titulo");
  const negritos = cartoes.filter((c) => c.tipo === "negrito");
  const misturados: Cartao[] = [];
  for (let i = 0; i < Math.max(titulos.length, negritos.length); i++) {
    if (titulos[i]) misturados.push(titulos[i]);
    if (negritos[i]) misturados.push(negritos[i]);
  }
  const inicio = (rodada * maximo) % misturados.length;
  return Array.from({ length: maximo }, (_, i) => misturados[(inicio + i) % misturados.length]);
}

/** Quantas rodadas diferentes dá para fazer com esses cartões. */
export const totalDeRodadas = (cartoes: Cartao[], maximo = CARTOES_POR_RODADA) => Math.max(1, Math.ceil(cartoes.length / maximo));

const escaparRegex = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Troca o termo da frente por "____" no verso, para a pista não entregar a resposta. */
export function esconderTermo(cartao: Pick<Cartao, "frente" | "verso">, lacuna = "____"): string {
  const termo = cartao.frente.trim();
  if (!termo) return cartao.verso;
  return cartao.verso.replace(new RegExp(escaparRegex(termo), "gi"), lacuna);
}
