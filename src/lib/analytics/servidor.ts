import "server-only";
import { cookies } from "next/headers";
import { COOKIE_FILA, gravarFila, lerFila, type NomeEvento, type ParametrosEvento } from "./eventos";

/**
 * Põe um evento na fila para o navegador mandar ao Google Analytics na próxima página.
 * Use em server actions e rotas, antes do redirect. Só sai do navegador se a pessoa aceitou os cookies.
 */
export async function marcarEvento(n: NomeEvento, p?: ParametrosEvento) {
  if (!process.env.NEXT_PUBLIC_GA_ID) return;
  const jar = await cookies();
  const fila = lerFila(jar.get(COOKIE_FILA)?.value);
  fila.push(p ? { n, p } : { n });
  jar.set(COOKIE_FILA, gravarFila(fila), { path: "/", maxAge: 120, sameSite: "lax", httpOnly: false });
}
