import type { ReactNode } from "react";
import { Cabecalho } from "@/components/Cabecalho";
import { iaConfigurada } from "@/lib/pratica/gerar";
import { NavConta } from "./NavConta";

/** Moldura das páginas de Minha conta: cabeçalho, título e abas. */
export function LayoutConta({ titulo, descricao, children }: { titulo: string; descricao?: string; children: ReactNode }) {
  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-3xl px-4 pt-8 pb-16">
        <p className="esconder-no-foco text-sm font-bold text-primaria">Minha conta</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{titulo}</h1>
        {descricao && <p className="esconder-no-foco mt-2 text-tinta-suave">{descricao}</p>}
        <div className="esconder-no-foco hidden sm:block">
          <NavConta comPraticas={iaConfigurada()} />
        </div>
        {children}
      </main>
    </>
  );
}
