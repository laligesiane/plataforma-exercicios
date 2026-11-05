import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { LIMITE_TRECHO, montarSsml } from "./natural";
import { partesDaFala } from ".";

// Chave e região do recurso "Speech" da Azure (plano grátis F0). Só existem no servidor.
const chave = () => process.env.AZURE_SPEECH_KEY ?? "";
const regiao = () => process.env.AZURE_SPEECH_REGION ?? "brazilsouth";

export const vozNaturalConfigurada = () => Boolean(chave());

/** Assinatura curta do texto, feita com a chave (o navegador nunca vê a chave). */
export function assinar(texto: string) {
  return createHmac("sha256", `repasa-voz:${chave()}`).update(texto).digest("base64url").slice(0, 22);
}

export function assinaturaValida(texto: string, assinatura: string) {
  const certa = Buffer.from(assinar(texto));
  const recebida = Buffer.from(assinatura);
  return certa.length === recebida.length && timingSafeEqual(certa, recebida);
}

/** Assinaturas de todas as partes que o leitor vai pedir (título, trechos e a amostra das vozes). */
export function assinaturasDaLeitura(textos: string[]): Record<string, string> {
  const mapa: Record<string, string> = {};
  for (const texto of textos) for (const parte of partesDaFala(texto)) mapa[parte] ??= assinar(parte);
  return mapa;
}

export type ResultadoVoz = { ok: true; audio: ArrayBuffer } | { ok: false; status: number };

/** Pede o áudio à Azure. No plano grátis, passar da cota devolve 429 e nada é cobrado. */
export async function sintetizar(texto: string, voz: string): Promise<ResultadoVoz> {
  if (!chave() || !texto.trim() || texto.length > LIMITE_TRECHO) return { ok: false, status: 400 };
  const resposta = await fetch(`https://${regiao()}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": chave(),
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
      "User-Agent": "repasa",
    },
    body: montarSsml(texto, voz),
  });
  if (!resposta.ok) return { ok: false, status: resposta.status };
  return { ok: true, audio: await resposta.arrayBuffer() };
}
