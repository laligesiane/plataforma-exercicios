import Link from "next/link";
import type { ReactNode } from "react";
import { Cabecalho } from "@/components/Cabecalho";

/** Molde das páginas de texto (privacidade, termos, sugestões): título, data e seções com leitura confortável. */
export function PaginaTexto({ titulo, subtitulo, children }: { titulo: string; subtitulo?: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Cabecalho />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-8 pb-24">
        <h1 className="text-3xl leading-tight font-extrabold tracking-tight">{titulo}</h1>
        {subtitulo && <p className="mt-2 text-sm text-tinta-suave">{subtitulo}</p>}
        <div className="mt-6 space-y-7 leading-relaxed text-tinta-suave">{children}</div>
        <RodapeLegal />
      </main>
    </div>
  );
}

export function Secao({ titulo, children, id }: { titulo: string; children: ReactNode; id?: string }) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="mb-2 text-lg font-extrabold text-tinta">{titulo}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

export function Lista({ children }: { children: ReactNode }) {
  return <ul className="list-disc space-y-1.5 pl-5">{children}</ul>;
}

/** Links entre as páginas de texto, para quem chega por uma encontrar as outras. */
export function RodapeLegal() {
  return (
    <nav aria-label="Páginas da Repasa" className="mt-12 flex flex-wrap gap-x-4 gap-y-2 border-t border-linha pt-6 text-sm">
      <Link href="/" className="font-bold text-primaria hover:underline">Página inicial</Link>
      <Link href="/privacidade" className="font-bold text-primaria hover:underline">Privacidade</Link>
      <Link href="/termos" className="font-bold text-primaria hover:underline">Termos de uso</Link>
      <Link href="/sugestoes" className="font-bold text-primaria hover:underline">Sugestões e contato</Link>
    </nav>
  );
}
