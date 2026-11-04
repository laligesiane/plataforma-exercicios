/** Mídia de um exercício: aparece no topo do cartão, antes dos itens. */
export type Midia =
  | { tipo: "imagem"; url: string; legenda?: string }
  | { tipo: "audio"; url: string; legenda?: string }
  | { tipo: "video"; url: string; legenda?: string };

export const tiposMidia = { imagem: "Imagem", audio: "Áudio", video: "Vídeo" } as const;

/** Tamanho máximo por arquivo enviado (igual ao limite do bucket no SQL 0006). */
export const LIMITE_ARQUIVO_MB = 20;

export const formatosAceitos = {
  imagem: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  audio: ["audio/mpeg", "audio/mp4", "audio/x-m4a", "audio/wav", "audio/ogg", "audio/webm"],
} as const;

/**
 * Converte um link do YouTube ou do Vimeo no endereço do player embutido.
 * Só esses dois são aceitos, para a página nunca embutir um site qualquer.
 */
export function enderecoDoVideo(link: string): string | null {
  let url: URL;
  try {
    url = new URL(link.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.replace(/^www\.|^m\./, "");

  let id: string | null = null;
  if (host === "youtu.be") id = url.pathname.slice(1).split("/")[0];
  else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname === "/watch") id = url.searchParams.get("v");
    else {
      const [, tipo, valor] = url.pathname.split("/");
      if (tipo === "embed" || tipo === "shorts" || tipo === "live") id = valor;
    }
    if (id && /^[\w-]{11}$/.test(id)) return `https://www.youtube-nocookie.com/embed/${id}`;
    return null;
  } else if (host === "vimeo.com" || host === "player.vimeo.com") {
    const numero = url.pathname.split("/").find((parte) => /^\d+$/.test(parte));
    return numero ? `https://player.vimeo.com/video/${numero}` : null;
  }

  return id && /^[\w-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
}

/** Imagem ou áudio: só links https (os enviados vão para o Storage do Supabase, que é https). */
export function ehLinkDeArquivo(link: unknown): link is string {
  if (typeof link !== "string" || link.length > 2000) return false;
  try {
    return new URL(link).protocol === "https:";
  } catch {
    return false;
  }
}

export function ehMidia(valor: unknown): valor is Midia {
  if (!valor || typeof valor !== "object") return false;
  const m = valor as Record<string, unknown>;
  if (m.legenda !== undefined && typeof m.legenda !== "string") return false;
  if (m.tipo === "video") return typeof m.url === "string" && enderecoDoVideo(m.url) !== null;
  if (m.tipo === "imagem" || m.tipo === "audio") return ehLinkDeArquivo(m.url) || ehImagemDaDemo(m.url);
  return false;
}

/** Imagens da aula de demonstração, servidas pelo próprio site (public/demo). */
function ehImagemDaDemo(url: unknown): boolean {
  return typeof url === "string" && /^\/demo\/[\w-]+\.svg$/.test(url);
}
