import "server-only";
import { cookies, headers } from "next/headers";
import { cache } from "react";
import { COOKIE_IDIOMA, ehIdiomaSite, idiomaDoNavegador, type IdiomaSite } from "./config";
import { dicionarios, type Dicionario } from "./dicionarios";

/**
 * Idioma desta visita: o escolhido no seletor (cookie) ou, na primeira visita, o do navegador.
 * Com login, o idioma da conta é copiado para o cookie (ver SincronizarIdioma).
 */
export const obterIdioma = cache(async (): Promise<IdiomaSite> => {
  const escolhido = (await cookies()).get(COOKIE_IDIOMA)?.value;
  if (ehIdiomaSite(escolhido)) return escolhido;
  return idiomaDoNavegador((await headers()).get("accept-language"));
});

export async function obterDicionario(): Promise<Dicionario> {
  return dicionarios[await obterIdioma()];
}
