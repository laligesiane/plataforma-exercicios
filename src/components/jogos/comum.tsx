"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Mascote } from "@/components/Mascote";
import { botaoPrimario, botaoSecundario } from "@/components/ui/estilos";

/** Barrinha de "3 de 10" no alto de cada jogo. */
export function Progresso({ feitos, total, extra }: { feitos: number; total: number; extra?: ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-sm font-semibold text-tinta-suave">
      <span className="tabular-nums">
        {feitos} de {total}
      </span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-suave">
        <div
          className="h-full rounded-full bg-primaria transition-[width] duration-500 motion-reduce:transition-none"
          style={{ width: `${total ? (feitos / total) * 100 : 0}%` }}
        />
      </div>
      {extra}
    </div>
  );
}

export type AcoesFim = {
  /** Joga de novo com os mesmos cartões, em outra ordem. */
  deNovo: () => void;
  /** Troca para os próximos 10 cartões, quando o resumo tem mais. */
  outrosCartoes?: () => void;
  /** Link da tela com todos os jogos. */
  hrefJogos: string;
};

/** Tela de fim de rodada, igual em todos os jogos. */
export function FimDeJogo({ titulo, texto, acoes }: { titulo: string; texto: ReactNode; acoes: AcoesFim }) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-primaria-suave p-8 text-center" role="status">
      <Mascote tamanho={96} animado />
      <p className="mt-3 text-xl font-extrabold">{titulo}</p>
      <p className="mt-1 text-tinta-suave">{texto}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={acoes.deNovo} className={botaoPrimario}>
          Jogar de novo
        </button>
        {acoes.outrosCartoes && (
          <button type="button" onClick={acoes.outrosCartoes} className={botaoSecundario}>
            Outros 10 cartões
          </button>
        )}
      </div>
      <Link href={acoes.hrefJogos} className="mt-4 text-sm font-bold text-primaria hover:underline">
        Escolher outro jogo
      </Link>
    </div>
  );
}

/** Frase de incentivo conforme o desempenho. Nada de nota. */
export function incentivo(acertos: number, total: number): string {
  if (total === 0) return "Pronto!";
  const parte = acertos / total;
  if (parte === 1) return "Mandou muito bem!";
  if (parte >= 0.7) return "Muito bom!";
  if (parte >= 0.4) return "Está pegando o jeito!";
  return "Cada rodada fixa mais um pouco.";
}
