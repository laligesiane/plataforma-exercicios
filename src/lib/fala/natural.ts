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

export const ehVozNatural = (id: string) => VOZES_NATURAIS.some((v) => v.id === id);

/** Maior trecho que a rota aceita (a fala vem dividida em partes de ~220 letras). */
export const LIMITE_TRECHO = 400;

const escapar = (t: string) =>
  t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

/** Pedido no formato SSML que a Azure espera. */
export function montarSsml(texto: string, voz: string) {
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="pt-BR"><voice name="${escapar(voz)}">${escapar(texto)}</voice></speak>`;
}

/** Endereço do áudio de uma parte. A assinatura impede que a rota leia textos que não estão num resumo. */
export const urlDaVoz = (texto: string, voz: string, assinatura: string) =>
  `/api/voz?${new URLSearchParams({ v: voz, t: texto, s: assinatura })}`;
