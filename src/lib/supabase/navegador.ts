import { createBrowserClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "./config";

export function criarClienteNavegador() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
