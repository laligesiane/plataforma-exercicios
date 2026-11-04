import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "./config";

/** Cliente com a chave service_role. Ignora o RLS: usar só em ações do servidor já autorizadas. */
export function criarClienteAdmin() {
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!chave) throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada.");
  return createClient(supabaseUrl, chave, { auth: { persistSession: false, autoRefreshToken: false } });
}
