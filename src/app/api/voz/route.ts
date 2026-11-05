import { NextResponse, type NextRequest } from "next/server";
import { ehVozNatural, LIMITE_TRECHO } from "@/lib/fala/natural";
import { assinaturaValida, sintetizar, vozNaturalConfigurada } from "@/lib/fala/servidor";

/**
 * Áudio de uma parte do resumo com voz natural. O mesmo texto com a mesma voz sempre dá o mesmo
 * áudio, então a resposta fica guardada no cache da Vercel e do navegador por um ano: ouvir de
 * novo não gasta a cota grátis da Azure.
 */
export async function GET(request: NextRequest) {
  if (!vozNaturalConfigurada()) return new NextResponse(null, { status: 404 });
  const p = request.nextUrl.searchParams;
  const texto = p.get("t") ?? "";
  const voz = p.get("v") ?? "";
  const assinatura = p.get("s") ?? "";
  if (!texto || texto.length > LIMITE_TRECHO || !ehVozNatural(voz) || !assinaturaValida(texto, assinatura)) {
    return new NextResponse(null, { status: 400 });
  }

  const resultado = await sintetizar(texto, voz);
  if (!resultado.ok) {
    // 429 = acabou a cota do mês (ou muitos pedidos juntos): o navegador volta para a voz do aparelho.
    return new NextResponse(null, { status: resultado.status === 429 ? 429 : 502, headers: { "Cache-Control": "no-store" } });
  }
  return new NextResponse(resultado.audio, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
    },
  });
}
