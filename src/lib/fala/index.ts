// Leitura em voz alta do resumo: escolha de voz, velocidade e o texto dividido em partes.
// Tudo usa a voz do próprio navegador (Web Speech API), sem custo e sem enviar nada.

import type { Documento, No } from "@/lib/documento";

/** O mínimo que precisamos de uma voz do navegador (SpeechSynthesisVoice). */
export type VozDoAparelho = { name: string; lang: string; voiceURI: string; localService?: boolean; default?: boolean };

/** Uma opção de voz mostrada ao aluno: uma voz do aparelho, com um tom. */
/** Uma opção de voz: do aparelho (voiceURI, tom) ou natural da Azure (natural = nome da voz lá). */
export type OpcaoVoz = { id: string; rotulo: string; detalhe?: string; voiceURI?: string; tom: number; natural?: string };

export const VELOCIDADES = [0.75, 1, 1.25, 1.5] as const;

/**
 * Trechos lidos do documento, na mesma ordem em que o <Documento> marca os blocos com data-trecho:
 * cada parágrafo ou título com texto é um trecho. Listas e citações são percorridas por dentro.
 */
export function trechosDoDocumento(doc: Documento): string[] {
  const trechos: string[] = [];
  const andar = (no: No): string => {
    if (no.type === "text") return no.text;
    if (no.type === "hardBreak") return " ";
    return (no.content ?? []).map(andar).join("");
  };
  const percorrer = (lista: No[]) => {
    for (const no of lista) {
      if (ehTrecho(no)) {
        const t = andar(no).replace(/\s+/g, " ").trim();
        if (t) trechos.push(t);
      } else if (no.type !== "text" && no.content) percorrer(no.content);
    }
  };
  percorrer(doc.content);
  return trechos;
}

/** Parágrafos e títulos são os blocos que viram trechos. */
export const ehTrecho = (no: No) => no.type === "paragraph" || no.type === "heading";

/**
 * Divide um trecho em falas curtas, por frase. Alguns navegadores (Chrome) param de ler
 * falas longas depois de uns 15 segundos; com partes curtas a leitura vai até o fim.
 */
export function partesDaFala(texto: string, limite = 220): string[] {
  const limpo = texto.replace(/\s+/g, " ").trim();
  if (!limpo) return [];
  const frases = limpo.match(/[^.!?…;:]+[.!?…;:]*["'”»)]*\s*/g) ?? [limpo];
  const partes: string[] = [];
  let atual = "";
  for (const frase of frases) {
    if ((atual + frase).length <= limite) {
      atual += frase;
      continue;
    }
    if (atual.trim()) partes.push(atual.trim());
    atual = "";
    if (frase.length <= limite) {
      atual = frase;
      continue;
    }
    // Frase gigante sem pontuação: corta nas vírgulas ou espaços.
    let resto = frase.trim();
    while (resto.length > limite) {
      const corte = Math.max(resto.lastIndexOf(", ", limite), resto.lastIndexOf(" ", limite));
      const fim = corte > limite / 3 ? corte + 1 : limite;
      partes.push(resto.slice(0, fim).trim());
      resto = resto.slice(fim).trim();
    }
    atual = resto ? resto + " " : "";
  }
  if (atual.trim()) partes.push(atual.trim());
  return partes;
}

/** A voz mais natural do aparelho para o idioma (usada nas atividades). */
export function melhorVoz<V extends VozDoAparelho>(vozes: V[], idioma: string): V | undefined {
  const [primeira] = opcoesDeVoz(vozes, idioma, 1);
  return primeira?.voiceURI ? vozes.find((v) => v.voiceURI === primeira.voiceURI) : undefined;
}

/** Nome da voz sem o que não ajuda a escolher ("Microsoft", "Online (Natural)", o idioma repetido). */
export function nomeAmigavel(voz: VozDoAparelho): string {
  const nome = voz.name
    .replace(/^(Microsoft|Google|Apple)\s+/i, "")
    .replace(/\s+-\s+.*$/, "")
    .replace(/\s*\([^)]*\)\s*$/, "")
    .replace(/\s*Online\s*$/i, "")
    .trim();
  return nome || voz.name;
}

function sotaque(lang: string) {
  const l = lang.toLowerCase().replace("_", "-");
  if (l.startsWith("pt-br")) return "Brasil";
  if (l.startsWith("pt-pt")) return "Portugal";
  return "";
}

/**
 * Opções de voz para o idioma. Usa as vozes do aparelho nesse idioma (as do Brasil primeiro) e,
 * se houver menos de duas, completa com versões da mesma voz em outro tom. Assim sempre há
 * pelo menos duas vozes para escolher, em qualquer celular ou computador.
 */
export function opcoesDeVoz(vozes: VozDoAparelho[], idioma = "pt-BR", maximo = 6): OpcaoVoz[] {
  const base = idioma.toLowerCase().split("-")[0];
  const preferida = idioma.toLowerCase().replace("_", "-");
  const doIdioma = vozes.filter((v) => v.lang.toLowerCase().replace("_", "-").split("-")[0] === base);

  const nota = (v: VozDoAparelho) => {
    const lang = v.lang.toLowerCase().replace("_", "-");
    const nome = v.name.toLowerCase();
    let n = 0;
    if (lang === preferida) n += 10;
    // Vozes neurais (Edge "Online (Natural)", iPhone "Premium"/"Aprimorada") soam bem mais humanas.
    if (/natural|neural|premium|enhanced|aprimorad|melhorad/.test(nome)) n += 6;
    if (/google/.test(nome)) n += 3;
    if (v.localService === false) n += 1; // vozes on-line costumam ser as melhores
    // Vozes robóticas antigas por último.
    if (/espeak|compact|desktop/.test(nome)) n -= 6;
    if (v.default) n += 1;
    return n;
  };
  const ordenadas = [...doIdioma].sort((a, b) => nota(b) - nota(a) || a.name.localeCompare(b.name));

  // Uma opção por nome amigável (o Edge repete a mesma voz "Online" e "local", por exemplo).
  const vistos = new Set<string>();
  const opcoes: OpcaoVoz[] = [];
  for (const v of ordenadas) {
    const rotulo = nomeAmigavel(v);
    const chave = `${rotulo}|${sotaque(v.lang)}`;
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    opcoes.push({ id: v.voiceURI, rotulo, detalhe: sotaque(v.lang) || undefined, voiceURI: v.voiceURI, tom: 1 });
    if (opcoes.length >= maximo) break;
  }

  if (opcoes.length >= 2) return opcoes;

  // Só uma voz (ou nenhuma listada): a mesma voz em três tons.
  const unica = opcoes[0];
  const voiceURI = unica?.voiceURI;
  const prefixo = unica ? `${unica.id}|` : "padrao|";
  return [
    { id: `${prefixo}1`, rotulo: "Normal", detalhe: unica?.rotulo, voiceURI, tom: 1 },
    { id: `${prefixo}grave`, rotulo: "Grave", detalhe: "tom mais baixo", voiceURI, tom: 0.7 },
    { id: `${prefixo}aguda`, rotulo: "Aguda", detalhe: "tom mais alto", voiceURI, tom: 1.35 },
  ];
}
