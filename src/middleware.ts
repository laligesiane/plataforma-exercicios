import type { NextRequest } from "next/server";
import { atualizarSessao } from "@/lib/supabase/sessao";

export function middleware(request: NextRequest) {
  return atualizarSessao(request);
}

export const config = {
  // /api/voz fica de fora: o áudio é igual para todos e precisa ir para o cache sem cookie de sessão.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/voz|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
