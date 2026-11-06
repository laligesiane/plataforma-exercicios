"use client";

import { createContext, useContext, type ReactNode } from "react";
import { IDIOMA_PADRAO, type IdiomaSite } from "./config";
import type { Dicionario } from "./dicionarios/pt";

type Valor = { idioma: IdiomaSite; d: Dicionario | null };
const Contexto = createContext<Valor>({ idioma: IDIOMA_PADRAO, d: null });

/**
 * Fica no layout. Recebe só o dicionário do idioma atual, vindo do servidor, para o navegador
 * não baixar os três.
 */
export function IdiomaProvider({ idioma, dicionario, children }: { idioma: IdiomaSite; dicionario: Dicionario; children: ReactNode }) {
  return <Contexto.Provider value={{ idioma, d: dicionario }}>{children}</Contexto.Provider>;
}

export function useIdioma(): IdiomaSite {
  return useContext(Contexto).idioma;
}

/** Textos da interface no idioma atual, para componentes de cliente. */
export function useDicionario(): Dicionario {
  const { d } = useContext(Contexto);
  if (!d) throw new Error("useDicionario fora do IdiomaProvider");
  return d;
}
