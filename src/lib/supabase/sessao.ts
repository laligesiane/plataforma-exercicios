import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { liberadaSemSegundaEtapa } from "@/lib/auth/destino";
import { supabaseAnonKey, supabaseConfigurado, supabaseUrl } from "./config";

export async function atualizarSessao(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!supabaseConfigurado) return response;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesParaGravar) {
        cookiesParaGravar.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesParaGravar.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Verificação em duas etapas ligada: até digitar o código do app, só a página de verificação abre.
  const caminho = request.nextUrl.pathname;
  if (user && !liberadaSemSegundaEtapa(caminho)) {
    const { data: nivel } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (nivel && nivel.currentLevel === "aal1" && nivel.nextLevel === "aal2") {
      const destino = request.nextUrl.clone();
      destino.pathname = "/entrar/verificar";
      destino.search = caminho.startsWith("/entrar") ? "" : `?proximo=${encodeURIComponent(caminho + request.nextUrl.search)}`;
      const redirecionar = NextResponse.redirect(destino);
      response.cookies.getAll().forEach((c) => redirecionar.cookies.set(c));
      return redirecionar;
    }
  }

  return response;
}
