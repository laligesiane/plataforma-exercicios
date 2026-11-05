"use client";

import { useState } from "react";
import { Mascote } from "@/components/Mascote";
import { botaoPrimario, botaoSecundario } from "@/components/ui/estilos";
import type { Cartao } from "@/lib/documento/cartoes";

/** Vira o cartão, responde "sabia" ou "ainda não". Os que ainda não sabe voltam no fim da rodada. */
export function EstudarCartoes({ cartoes }: { cartoes: Cartao[] }) {
  const [fila, setFila] = useState(cartoes);
  const [virado, setVirado] = useState(false);
  const [sabia, setSabia] = useState(0);
  const [repetidos, setRepetidos] = useState(new Set<string>());
  const atual = fila[0];

  function responder(acertou: boolean) {
    if (!atual) return;
    if (acertou) {
      if (!repetidos.has(atual.id)) setSabia((n) => n + 1);
      setFila((f) => f.slice(1));
    } else {
      setRepetidos((r) => new Set(r).add(atual.id));
      setFila((f) => [...f.slice(1), atual]);
    }
    setVirado(false);
  }

  if (!atual) {
    return (
      <div className="flex flex-col items-center rounded-2xl bg-primaria-suave p-8 text-center">
        <Mascote tamanho={96} animado />
        <p className="mt-3 text-xl font-extrabold">Rodada concluída!</p>
        <p className="mt-1 text-tinta-suave">
          Você sabia {sabia} de {cartoes.length} de primeira.
          {repetidos.size > 0 ? ` ${repetidos.size} precisaram de mais uma volta.` : ""}
        </p>
        <button
          type="button"
          onClick={() => {
            setFila(cartoes);
            setSabia(0);
            setRepetidos(new Set());
          }}
          className={`${botaoPrimario} mt-5`}
        >
          Estudar de novo
        </button>
      </div>
    );
  }

  const feitos = cartoes.length - new Set(fila.map((c) => c.id)).size;

  return (
    <div>
      <div className="flex items-center gap-3 text-sm font-semibold text-tinta-suave">
        <span className="tabular-nums">
          {feitos} de {cartoes.length}
        </span>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-suave">
          <div className="h-full rounded-full bg-primaria transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${(feitos / cartoes.length) * 100}%` }} />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setVirado((v) => !v)}
        aria-label={virado ? "Mostrar a frente do cartão" : "Virar o cartão"}
        className={`mt-5 flex min-h-64 w-full flex-col items-center justify-center rounded-3xl border-2 p-8 text-center transition-colors ${
          virado ? "border-primaria bg-primaria-suave" : "border-linha bg-fundo hover:border-primaria"
        }`}
      >
        <span className="text-xs font-bold tracking-wide text-tinta-suave uppercase">{virado ? "Verso" : "Frente"}</span>
        {virado ? (
          <span className="mt-3 text-lg whitespace-pre-line">{atual.verso}</span>
        ) : (
          <span className="mt-3 text-2xl font-extrabold">{atual.frente}</span>
        )}
        {!virado && <span className="mt-4 text-sm text-tinta-suave">Pense na resposta e toque para virar.</span>}
      </button>

      {virado && (
        <div className="mt-4 flex justify-center gap-3">
          <button type="button" onClick={() => responder(false)} className={botaoSecundario}>
            Ainda não sabia
          </button>
          <button type="button" onClick={() => responder(true)} className={botaoPrimario}>
            Sabia!
          </button>
        </div>
      )}
    </div>
  );
}
