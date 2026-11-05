import type { Documento, No } from ".";

/**
 * De onde o cartão veio:
 * - "titulo": um título e o texto embaixo dele;
 * - "definicao": um negrito que abre uma definição ("**Indução** é ...", "**Indução**: ...");
 * - "lacuna": um negrito no meio de uma frase. Não é termo e explicação: serve para completar a frase.
 * Nos negritos, "frase" guarda a frase inteira em que o termo aparece.
 */
export type Cartao = { id: string; frente: string; verso: string; tipo: "titulo" | "definicao" | "lacuna"; frase?: string };

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

/** Palavrinhas soltas que não fazem um bom cartão quando aparecem sozinhas em negrito. */
const PALAVRAS_FRACAS = new Set(
  "a o as os um uma uns umas de da do das dos em no na nos nas e ou mas que se por para com sem não sim é são foi ser ter isso isto esse essa este esta muito mais menos também já ainda sempre nunca todo toda todos todas cada".split(" "),
);

const SUBSTANTIVOS_EM_R = new Set("mulher colher prazer poder dever ser saber talher alter elixir faquir nadir".split(" "));

/**
 * Um negrito vira cartão só se for um termo de verdade: nem curto demais, nem comprido demais,
 * e não uma palavra solta qualquer, como um verbo no infinitivo ("avaliar") ou um "não".
 * Termos com mais de uma palavra, siglas e nomes com maiúscula sempre passam.
 */
export function termoBom(termo: string): boolean {
  const t = termo.trim().replace(/[.,;:!?]+$/, "");
  if (t.length < 2 || t.length > 80) return false;
  if (/\s/.test(t)) return true;
  if (/^\p{Lu}/u.test(t) || /\d/.test(t)) return true;
  const minusculo = t.toLowerCase();
  if (PALAVRAS_FRACAS.has(minusculo) || minusculo.length < 4) return false;
  // Verbo solto no infinitivo (avaliar, fazer, definir, pôr) quase nunca é o conceito que se quer estudar.
  // Ficam de fora os substantivos e adjetivos comuns com a mesma terminação (celular, nuclear, mulher...).
  if (/(ar|er|ir)$/.test(minusculo) && !/(ular|olar|lear|unar|gar|mar)$/.test(minusculo) && !SUBSTANTIVOS_EM_R.has(minusculo)) return false;
  return true;
}

/** A frase do parágrafo em que o termo aparece (ou o parágrafo inteiro, se não achar). */
export function fraseCom(texto: string, termo: string): string {
  const frases = texto.split(/(?<=[.!?…])\s+|\n+/);
  return (frases.find((f) => f.toLowerCase().includes(termo.toLowerCase())) ?? texto).trim();
}

const escaparRegex = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Se a frase começa pelo termo e logo define ("Indução é ...", "Indução: ...", "Indução – ..."),
 * devolve só a explicação, com a primeira letra maiúscula. Senão, nada.
 */
export function definicaoDe(frase: string, termo: string): string | null {
  const m = frase
    .trim()
    .match(new RegExp(`^${escaparRegex(termo)}\\s*(?:[:–—-]|,?\\s*(?:é|são|significa|consiste em|refere-se a|representa)(?=\\s))\\s*(.{8,})$`, "iu"));
  if (!m) return null;
  const resto = m[1].trim();
  return resto.charAt(0).toLocaleUpperCase() + resto.slice(1);
}

/**
 * Cartões de estudo montados do próprio resumo, sem IA:
 * - cada título ou subtítulo vira a frente, e o texto logo abaixo dele vira o verso;
 * - cada trecho em negrito vira a frente, e a frase (ou item de lista) em que ele está vira o verso.
 */
export function cartoesDoDocumento(doc: Documento): Cartao[] {
  const cartoes: Cartao[] = [];
  const frentes = new Set<string>();
  const adicionar = (frente: string, verso: string, tipo: Cartao["tipo"], frase?: string) => {
    // Tira a numeração dos títulos ("2. Indução", "II - Indução") e os dois-pontos do fim.
    const f = frente
      .trim()
      .replace(/^\d+(\.\d+)*(\s*[.)\-–]\s*|\s+)(?=\p{L})/u, "")
      .replace(/^[IVX]{1,4}\s*[.)\-–]\s+/, "")
      .replace(/[:：]\s*$/, "");
    const v = encurtar(verso);
    const chave = f.toLowerCase();
    if (!f || !v || v.toLowerCase() === chave || frentes.has(chave)) return;
    frentes.add(chave);
    cartoes.push({ id: `c${cartoes.length + 1}`, frente: f, verso: v, tipo, ...(frase ? { frase: encurtar(frase) } : {}) });
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

  // Negritos: se abrem uma definição, viram termo e explicação; se estão no meio da frase, viram lacuna.
  const visitar = (no: No) => {
    if (no.type === "paragraph" || no.type === "listItem") {
      const filhos = no.content ?? [];
      const texto = textoDe(no);
      for (const f of filhos) {
        if (f.type === "text" && f.marks?.some((m) => m.type === "bold")) {
          const termo = f.text.trim();
          if (!termoBom(termo)) continue;
          const frase = fraseCom(texto, termo);
          const definicao = definicaoDe(frase, termo);
          if (definicao) adicionar(termo, definicao, "definicao", frase);
          else adicionar(termo, frase, "lacuna", frase);
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
  const negritos = cartoes.filter((c) => c.tipo !== "titulo");
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

/** Troca o termo da frente por "____" no verso, para a pista não entregar a resposta. */
export function esconderTermo(cartao: Pick<Cartao, "frente" | "verso">, lacuna = "____"): string {
  const termo = cartao.frente.trim();
  if (!termo) return cartao.verso;
  return cartao.verso.replace(new RegExp(escaparRegex(termo), "gi"), lacuna);
}
