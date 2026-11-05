"use server";

import { revalidatePath } from "next/cache";
import { BUCKET_FOTO, fotoValida } from "@/lib/foto";
import { criarClienteServidor } from "@/lib/supabase/servidor";

type Resultado = { erro?: string };

/** Guarda no perfil a foto que o navegador acabou de enviar e apaga a anterior. */
export async function salvarFoto(caminho: string): Promise<Resultado> {
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erro: "Entre de novo para trocar a foto." };
  if (!fotoValida(caminho, user.id)) return { erro: "Não foi possível salvar a foto." };

  const { data: antes } = await supabase.from("perfil").select("foto").eq("id", user.id).single();
  const { error } = await supabase.from("perfil").update({ foto: caminho }).eq("id", user.id);
  if (error) {
    await supabase.storage.from(BUCKET_FOTO).remove([caminho]);
    return { erro: "Não foi possível salvar a foto. Tente de novo em instantes." };
  }
  if (antes?.foto && antes.foto !== caminho) await supabase.storage.from(BUCKET_FOTO).remove([antes.foto]);
  revalidatePath("/", "layout");
  return {};
}

export async function removerFoto(): Promise<Resultado> {
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erro: "Entre de novo para remover a foto." };

  const { data: antes } = await supabase.from("perfil").select("foto").eq("id", user.id).single();
  const { error } = await supabase.from("perfil").update({ foto: null }).eq("id", user.id);
  if (error) return { erro: "Não foi possível remover a foto." };
  if (antes?.foto) await supabase.storage.from(BUCKET_FOTO).remove([antes.foto]);
  revalidatePath("/", "layout");
  return {};
}
