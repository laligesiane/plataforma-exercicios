import { obterDicionario } from "@/i18n/servidor";
import Link from "next/link";
import type { ReactNode } from "react";
import { Cabecalho } from "@/components/Cabecalho";

/** Moldura das páginas de Minha conta: cabeçalho (com o menu) e título. */
export async function LayoutConta({
  titulo,
  descricao,
  voltar,
  children,
}: {
  titulo: string;
  descricao?: string;
  /** Página "de dentro" de outra (ex.: Repasar dentro de Atividades): mostra o link de volta no lugar de "Minha conta". */
  voltar?: { href: string; rotulo: string };
  children: ReactNode;
}) {
  const tx = (await obterDicionario()).aluno;
  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-7xl px-4 pt-8 pb-16 sm:px-6 lg:px-8">
        {voltar ? (
          <Link href={voltar.href} className="esconder-no-foco inline-flex items-center gap-1.5 text-sm font-bold text-primaria hover:underline">
            <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
            {voltar.rotulo}
          </Link>
        ) : (
          <p className="esconder-no-foco text-sm font-bold text-primaria">{tx.minhaConta}</p>
        )}
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{titulo}</h1>
        {descricao && <p className="esconder-no-foco mt-2 text-tinta-suave">{descricao}</p>}
        {children}
      </main>
    </>
  );
}
