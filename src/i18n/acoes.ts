"use server";

import { cookies } from "next/headers";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { supabaseConfigurado } from "@/lib/supabase/config";
import { COOKIE_IDIOMA, ehIdiomaSite } from "./config";

const UM_ANO = 60 * 60 * 24 * 365;

/** Troca o idioma da interface: guarda no cookie e, com login, na conta (perfil.idioma, 0039). */
export async function trocarIdioma(idioma: string, salvarNaConta = true): Promise<{ erro?: boolean }> {
  if (!ehIdiomaSite(idioma)) return { erro: true };
  (await cookies()).set(COOKIE_IDIOMA, idioma, { path: "/", maxAge: UM_ANO, sameSite: "lax" });

  if (!salvarNaConta || !supabaseConfigurado) return {};
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};
  const { error } = await supabase.from("perfil").update({ idioma }).eq("id", user.id);
  // Sem a coluna (0039 ainda não rodada), o cookie já resolve neste aparelho.
  if (error && !/idioma/.test(error.message)) return { erro: true };
  return {};
}
