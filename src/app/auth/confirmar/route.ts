import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// Retorno dos e-mails do Supabase.
// Modelo padrão: ?code=... (confirmação de cadastro e volta do Google). Modelo personalizado: ?token_hash=...&type=...
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const codigo = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const tipo = searchParams.get("type") as EmailOtpType | null;
  const proximo = searchParams.get("next");
  // O Google volta com ?error=... quando a pessoa cancela ou o provedor não está ligado.
  if (searchParams.get("error")) return NextResponse.redirect(`${origin}/entrar?erro=google`);
  const supabase = await criarClienteServidor();

  if (codigo) {
    const { error } = await supabase.auth.exchangeCodeForSession(codigo);
    if (!error) return NextResponse.redirect(`${origin}${destinoSeguro(proximo, "/entrar")}`);
  } else if (tokenHash && tipo) {
    const { error } = await supabase.auth.verifyOtp({ type: tipo, token_hash: tokenHash });
    if (!error) {
      const padrao = tipo === "invite" || tipo === "recovery" ? "/definir-senha" : "/entrar";
      return NextResponse.redirect(`${origin}${destinoSeguro(proximo, padrao)}`);
    }
  }

  return NextResponse.redirect(`${origin}/entrar?erro=link`);
}

/** Só aceita caminhos internos, para o link não virar um redirecionamento para outro site. */
function destinoSeguro(caminho: string | null, padrao: string) {
  return caminho && caminho.startsWith("/") && !caminho.startsWith("//") ? caminho : padrao;
}
