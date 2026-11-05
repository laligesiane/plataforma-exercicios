import type { Metadata } from "next";
import Link from "next/link";
import { Icone } from "@/components/jogos/Icones";
import { Cabecalho } from "@/components/Cabecalho";
import { CARTOES_POR_RODADA } from "@/lib/documento/cartoes";
import { cartoesUteis, jogos } from "@/lib/documento/jogos";
import { carregarCartoes } from "./dados";

export const metadata: Metadata = { title: "Jogos do resumo · Repasa" };

export default async function JogosDoResumo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { titulo, cartoes } = await carregarCartoes(id);

  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-7xl px-4 pt-8 pb-16 sm:px-6 lg:px-8">
        <Link href={`/aluno/resumos/${id}`} className="text-sm font-bold text-primaria hover:underline">
          ← Voltar ao resumo
        </Link>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight">Estudar brincando: {titulo}</h1>
        <p className="mt-2 mb-6 text-tinta-suave">
          Feitos dos títulos e dos trechos em negrito do resumo. Cada rodada usa no máximo {CARTOES_POR_RODADA} cartões
          {cartoes.length > CARTOES_POR_RODADA ? `, e este resumo tem ${cartoes.length}: no fim dá para jogar com outros.` : "."}
        </p>
        {cartoes.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-linha p-6 text-center text-sm text-tinta-suave">
            Este resumo ainda não tem títulos com texto embaixo nem trechos em negrito. Use Título e Negrito no editor para gerar os jogos.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {jogos.map((j) => {
              const uteis = cartoesUteis(j.modo, cartoes);
              const pode = uteis >= j.minimo;
              return (
                <li key={j.modo}>
                  {pode ? (
                    <Link
                      href={`/aluno/resumos/${id}/jogar/${j.modo}`}
                      className="flex h-full items-start gap-3 rounded-2xl border-2 border-linha bg-fundo p-4 transition-colors hover:border-primaria hover:bg-primaria-suave"
                    >
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primaria-suave text-primaria">
                        <Icone nome={j.modo} className="size-6" />
                      </span>
                      <span>
                        <span className="block font-extrabold">{j.nome}</span>
                        <span className="mt-0.5 block text-sm text-tinta-suave">{j.descricao}</span>
                      </span>
                    </Link>
                  ) : (
                    <div className="flex h-full items-start gap-3 rounded-2xl border-2 border-dashed border-linha p-4 opacity-70">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-suave text-tinta-suave">
                        <Icone nome={j.modo} className="size-6" />
                      </span>
                      <span>
                        <span className="block font-extrabold">{j.nome}</span>
                        <span className="mt-0.5 block text-sm text-tinta-suave">
                          {j.modo === "complete"
                            ? "Precisa de pelo menos 2 palavras em negrito dentro de frases."
                            : `Precisa de pelo menos ${j.minimo} termos com explicação: títulos com texto embaixo, ou um negrito no começo de uma definição ("**Indução** é...").`}
                        </span>
                      </span>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
