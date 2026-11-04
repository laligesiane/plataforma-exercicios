"use client";

import { criarClienteNavegador } from "@/lib/supabase/navegador";
import { formatosAceitos, LIMITE_ARQUIVO_MB } from "./midia";

export type TipoArquivo = keyof typeof formatosAceitos;

const extensoes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "audio/wav": "wav",
  "audio/ogg": "ogg",
  "audio/webm": "webm",
};

/**
 * Envia o arquivo para o Storage do Supabase, na pasta do próprio professor, e devolve o link público.
 * As regras do bucket (SQL 0006) repetem estes limites no servidor.
 */
export async function enviarArquivo(arquivo: File, tipo: TipoArquivo): Promise<{ url: string } | { erro: string }> {
  const aceitos: readonly string[] = formatosAceitos[tipo];
  if (!aceitos.includes(arquivo.type)) {
    return { erro: tipo === "imagem" ? "Use uma imagem JPG, PNG, WebP ou GIF." : "Use um áudio MP3, M4A, WAV, OGG ou WebM." };
  }
  if (arquivo.size > LIMITE_ARQUIVO_MB * 1024 * 1024) {
    return { erro: `O arquivo passa de ${LIMITE_ARQUIVO_MB} MB. Tente um menor.` };
  }

  const supabase = criarClienteNavegador();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { erro: "Sua sessão expirou. Entre de novo para enviar arquivos." };

  const caminho = `${data.user.id}/${crypto.randomUUID()}.${extensoes[arquivo.type]}`;
  const { error } = await supabase.storage
    .from("midia")
    .upload(caminho, arquivo, { contentType: arquivo.type, cacheControl: "31536000", upsert: false });
  if (error) return { erro: "Não deu para enviar o arquivo. Tente de novo em instantes." };

  return { url: supabase.storage.from("midia").getPublicUrl(caminho).data.publicUrl };
}
