// Gera um mapa mental a partir do resumo: seções viram ramos, subseções viram galhos e os pontos viram detalhes.
import { LIMITES, novoId, ordemCores, type Mapa, type No as NoMapa } from "../mapas";
import type { Documento, No } from "./index";

type Parte = { titulo: string; pontos: string[]; partes: Parte[] };

function textoDe(no: No): string {
  if (no.type === "text") return no.text;
  if (no.type === "hardBreak") return " ";
  return (no.content ?? []).map(textoDe).join("");
}

/** Deixa o texto curto o bastante para uma caixa do mapa: a primeira frase, cortada numa palavra. */
export function encurtar(texto: string, max: number = LIMITES.texto) {
  let t = texto.replace(/\s+/g, " ").trim();
  if (t.length > max) {
    const frase = t.split(/(?<=[.!?;:])\s/)[0];
    if (frase.length <= max) t = frase;
  }
  if (t.length <= max) return t;
  const corte = t.slice(0, max - 1);
  const espaco = corte.lastIndexOf(" ");
  return `${(espaco > max / 2 ? corte.slice(0, espaco) : corte).replace(/[\s,.;:–-]+$/, "")}…`;
}

/** Pontos de um bloco: cada item de lista, cada parágrafo, cada linha de nota. */
function pontosDe(no: No): string[] {
  switch (no.type) {
    case "bulletList":
    case "orderedList":
      return (no.content ?? []).flatMap((item) => {
        const primeiro = (item.type !== "text" && item.content?.find((f) => f.type === "paragraph")) || null;
        const t = primeiro ? textoDe(primeiro).trim() : "";
        return t ? [t] : [];
      });
    case "blockquote":
      return (no.content ?? []).flatMap(pontosDe);
    case "paragraph": {
      const t = textoDe(no).trim();
      return t ? [t] : [];
    }
    default:
      return [];
  }
}

/** Monta o esboço do documento: títulos (nível 2) com subtítulos (nível 3) e os pontos de cada um. */
export function esbocoDoDocumento(doc: Documento): Parte {
  const raiz: Parte = { titulo: "", pontos: [], partes: [] };
  let secao: Parte | null = null;
  let sub: Parte | null = null;
  for (const no of doc.content) {
    if (no.type === "heading") {
      const titulo = textoDe(no).trim();
      if (!titulo) continue;
      const parte: Parte = { titulo, pontos: [], partes: [] };
      if (no.attrs?.level === 3 && secao) {
        secao.partes.push(parte);
        sub = parte;
      } else if (no.attrs?.level === 3) {
        // Subtítulo sem título antes: vira seção.
        raiz.partes.push(parte);
        secao = parte;
        sub = null;
      } else {
        raiz.partes.push(parte);
        secao = parte;
        sub = null;
      }
      continue;
    }
    (sub ?? secao ?? raiz).pontos.push(...pontosDe(no));
  }
  return raiz;
}

function noDe(parte: Parte, nivel: number): NoMapa {
  const filhos: NoMapa[] = [];
  if (nivel < LIMITES.profundidade) {
    for (const p of parte.pontos) filhos.push({ id: novoId(), texto: encurtar(p), filhos: [] });
    for (const p of parte.partes) filhos.push(noDe(p, nivel + 1));
  }
  return { id: novoId(), texto: encurtar(parte.titulo), filhos: filhos.slice(0, LIMITES.filhos) };
}

/** Mapa mental a partir do resumo. `titulo` é o título do resumo, usado no centro. */
export function mapaDoDocumento(doc: Documento, titulo = ""): Mapa {
  let raiz = esbocoDoDocumento(doc);
  let centro = titulo.trim();

  // Um único título no começo com subtítulos embaixo (ex.: "Resumo de Geometria" > "1. ...", "2. ..."):
  // ele vira o centro e os subtítulos viram os ramos.
  if (raiz.partes.length === 1 && raiz.partes[0].partes.length > 0) {
    const unica = raiz.partes[0];
    if (!centro) centro = unica.titulo;
    raiz = { titulo: "", pontos: raiz.pontos, partes: unica.partes };
  }

  if (!centro) centro = raiz.partes[0]?.titulo ?? "";

  const nos: NoMapa[] =
    raiz.partes.length > 0
      ? raiz.partes.map((p) => noDe(p, 1))
      : raiz.pontos.map((p) => ({ id: novoId(), texto: encurtar(p), filhos: [] }));

  return {
    centro: encurtar(centro),
    ramos: nos.slice(0, LIMITES.ramos).map((n, i) => ({ ...n, cor: ordemCores[i % ordemCores.length] })),
  };
}
