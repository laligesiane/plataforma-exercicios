import "server-only";
import { obterPerfil, paginaInicial } from "@/lib/perfil";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { caminhoInterno } from "./destino";

/** Para onde mandar quem acabou de entrar (senha, código por e-mail, Google ou app autenticador). */
export async function destinoDepoisDoLogin(proximo?: string | null): Promise<string> {
  const supabase = await criarClienteServidor();
  const { data: nivel } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  const seguro = caminhoInterno(proximo);
  if (nivel?.currentLevel === "aal1" && nivel.nextLevel === "aal2") {
    return seguro ? `/entrar/verificar?proximo=${encodeURIComponent(seguro)}` : "/entrar/verificar";
  }

  const perfil = await obterPerfil();
  if (!perfil) return "/";
  if (!perfil.papel_escolhido) return "/bem-vindo";
  return seguro ?? paginaInicial(perfil.papel);
}
