import { PALAVROES, RAIZES } from "./lista";

const LEET: Record<string, string> = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "8": "b", "@": "a", $: "s", "!": "i" };

/** Minúsculas, sem acento, números no lugar de letras desfeitos e letras repetidas juntadas. */
export function normalizar(palavra: string) {
  return palavra
    .toLowerCase()
    .replace(/ñ/g, "n")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[0134578@$!]/g, (c) => LEET[c] ?? c)
    .replace(/[^a-z]/g, "")
    .replace(/(.)\1+/g, "$1");
}

const PROIBIDAS = new Set(Object.values(PALAVROES).flat().map(normalizar));
const PREFIXOS = RAIZES.map(normalizar);

function proibida(normal: string) {
  if (!normal) return false;
  if (PROIBIDAS.has(normal)) return true;
  // Plural e variações simples: putas, mierdas, fucks, bitches.
  if (normal.endsWith("es") && PROIBIDAS.has(normal.slice(0, -2))) return true;
  if (normal.endsWith("s") && PROIBIDAS.has(normal.slice(0, -1))) return true;
  return PREFIXOS.some((p) => normal.startsWith(p));
}

/**
 * Procura um palavrão no texto e devolve a palavra como foi escrita (ou null).
 * Também pega palavra soletrada com espaços ou pontos ("p u t a", "m.e.r.d.a").
 */
export function acharPalavrao(texto: string | null | undefined): string | null {
  if (!texto) return null;
  // Palavras: letras, números e os símbolos que viram letra; o hífen fica (foda-se).
  // O "!" só vale como letra no meio da palavra (sh!t); no fim é exclamação ("mierda!").
  const pedacos = (texto.match(/[\p{L}\p{N}@$!]+(?:-[\p{L}\p{N}@$!]+)*/gu) ?? []).map((p) => p.replace(/^!+|!+$/g, "")).filter(Boolean);

  for (const p of pedacos) {
    if (proibida(normalizar(p))) return p;
    // "foda-se" também é conferida em partes.
    if (p.includes("-")) for (const parte of p.split("-")) if (proibida(normalizar(parte))) return p;
  }

  // Letras soltas seguidas (p u t a): junta e confere.
  let soltas: string[] = [];
  const conferirSoltas = () => {
    if (soltas.length >= 2 && proibida(normalizar(soltas.join("")))) return soltas.join(" ");
    soltas = [];
    return null;
  };
  for (const p of pedacos) {
    if ([...p].length === 1) soltas.push(p);
    else {
      const achou = conferirSoltas();
      if (achou) return achou;
    }
  }
  return conferirSoltas();
}

/** Texto de um documento TipTap (resumo): junta todos os pedaços de texto. */
export function textoDoDocumento(doc: unknown): string {
  const partes: string[] = [];
  const andar = (n: unknown) => {
    if (!n || typeof n !== "object") return;
    const no = n as { text?: unknown; content?: unknown };
    if (typeof no.text === "string") partes.push(no.text);
    if (Array.isArray(no.content)) no.content.forEach(andar);
  };
  andar(doc);
  return partes.join(" ");
}

const CHAVE_TECNICA = /(^id$|_id$|Id$|url|src|caminho|arquivo|audio|imagem|video|tipo)/i;

/** Todos os textos de um objeto (exercícios, mapa mental), sem ids, endereços e nomes de arquivo. */
export function textosDoObjeto(valor: unknown): string {
  const partes: string[] = [];
  const andar = (v: unknown) => {
    if (typeof v === "string") partes.push(v);
    else if (Array.isArray(v)) v.forEach(andar);
    else if (v && typeof v === "object") for (const [k, filho] of Object.entries(v)) if (!CHAVE_TECNICA.test(k)) andar(filho);
  };
  andar(valor);
  return partes.join(" \n ");
}
