// Vozes naturais (neurais) da Microsoft Azure, usadas no "Ouvir o resumo" quando a chave está configurada.
// Este arquivo não tem segredo: só a lista de vozes e a montagem do pedido.

export type VozNatural = { id: string; rotulo: string; detalhe: string };

/** Vozes do Brasil oferecidas, na ordem em que aparecem para o aluno. */
export const VOZES_NATURAIS: VozNatural[] = [
  { id: "pt-BR-FranciscaNeural", rotulo: "Francisca", detalhe: "natural" },
  { id: "pt-BR-AntonioNeural", rotulo: "Antonio", detalhe: "natural" },
  { id: "pt-BR-ThalitaNeural", rotulo: "Thalita", detalhe: "natural" },
  { id: "pt-BR-DonatoNeural", rotulo: "Donato", detalhe: "natural" },
];

/** Frase tocada quando o aluno toca numa voz para ouvir como ela soa. */
export const AMOSTRA = "Oi! Eu vou ler o seu resumo com esta voz.";

/**
 * Vozes naturais de cada idioma estrangeiro, oferecidas junto com as do Brasil quando o resumo é de um curso
 * de idioma (o aluno escolhe: explicação em português ou o texto com a pronúncia do idioma).
 */
export const VOZES_NATURAIS_IDIOMA: Record<string, VozNatural[]> = {
  es: [
    { id: "es-ES-ElviraNeural", rotulo: "Elvira", detalhe: "espanhol" },
    { id: "es-ES-AlvaroNeural", rotulo: "Álvaro", detalhe: "espanhol" },
  ],
  en: [
    { id: "en-US-JennyNeural", rotulo: "Jenny", detalhe: "inglês" },
    { id: "en-US-GuyNeural", rotulo: "Guy", detalhe: "inglês" },
  ],
  fr: [
    { id: "fr-FR-DeniseNeural", rotulo: "Denise", detalhe: "francês" },
    { id: "fr-FR-HenriNeural", rotulo: "Henri", detalhe: "francês" },
  ],
  it: [
    { id: "it-IT-ElsaNeural", rotulo: "Elsa", detalhe: "italiano" },
    { id: "it-IT-DiegoNeural", rotulo: "Diego", detalhe: "italiano" },
  ],
  de: [
    { id: "de-DE-KatjaNeural", rotulo: "Katja", detalhe: "alemão" },
    { id: "de-DE-ConradNeural", rotulo: "Conrad", detalhe: "alemão" },
  ],
};

/** Código BCP 47 da voz do aparelho para cada idioma da Repasa. */
export const LOCALE_IDIOMA: Record<string, string> = { es: "es-ES", en: "en-US", fr: "fr-FR", it: "it-IT", de: "de-DE", pt: "pt-BR" };

const todasNaturais = [...VOZES_NATURAIS, ...Object.values(VOZES_NATURAIS_IDIOMA).flat()];

export const ehVozNatural = (id: string) => todasNaturais.some((v) => v.id === id);

/** "es-ES" de "es-ES-ElviraNeural": a Azure quer o xml:lang igual ao idioma da voz. */
const localeDaVoz = (voz: string) => /^[a-z]{2}-[A-Z]{2}/.exec(voz)?.[0] ?? "pt-BR";

/** Maior trecho que a rota aceita (a fala vem dividida em partes de ~220 letras). */
export const LIMITE_TRECHO = 400;

const escapar = (t: string) =>
  t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

/** Pedido no formato SSML que a Azure espera. */
export function montarSsml(texto: string, voz: string) {
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${localeDaVoz(voz)}"><voice name="${escapar(voz)}">${escapar(texto)}</voice></speak>`;
}

/** Endereço do áudio de uma parte. A assinatura impede que a rota leia textos que não estão num resumo. */
export const urlDaVoz = (texto: string, voz: string, assinatura: string) =>
  `/api/voz?${new URLSearchParams({ v: voz, t: texto, s: assinatura })}`;
