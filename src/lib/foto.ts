import { supabaseUrl } from "./supabase/config";

/** Bucket público das fotos de perfil (SQL 0037). Cada pessoa guarda a foto na pasta <id>/. */
export const BUCKET_FOTO = "avatar";

/** Caminho salvo em perfil.foto: sempre na pasta da própria pessoa. Mesma regra do banco. */
export function fotoValida(caminho: string, dono: string): boolean {
  return /^[0-9a-f-]{36}\/[A-Za-z0-9-]{1,60}\.(jpg|png|webp)$/.test(caminho) && caminho.split("/")[0] === dono;
}

/** Link público da foto, ou null se a pessoa não tem foto. */
export function urlDaFoto(caminho: string | null | undefined): string | null {
  if (!caminho || !supabaseUrl) return null;
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET_FOTO}/${caminho}`;
}
