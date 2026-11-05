"use client";

import { useRef, useState } from "react";
import { botaoPrimario, botaoSecundario } from "@/components/ui/estilos";
import type { Cartao } from "@/lib/documento/cartoes";
import { FimDeJogo, Progresso, type AcoesFim } from "./comum";

/** Quanto o dedo precisa andar para o deslize valer como resposta. */
const LIMITE = 90;

/**
 * Vira o cartão, responde "sabia" ou "ainda não". Os que ainda não sabe voltam no fim da rodada.
 * Com o cartão virado, dá para deslizar: para a direita é "sabia", para a esquerda "ainda não".
 */
export function EstudarCartoes({ cartoes, acoes }: { cartoes: Cartao[]; acoes: AcoesFim }) {
  const [fila, setFila] = useState(cartoes);
  const [virado, setVirado] = useState(false);
  const [sabia, setSabia] = useState(0);
  const [repetidos, setRepetidos] = useState(new Set<string>());
  const atual = fila[0];
  const [arraste, setArraste] = useState(0);
  const inicio = useRef<number | null>(null);
  const arrastou = useRef(false);
  const [arrastando, setArrastando] = useState(false);

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
    setArraste(0);
  }

  if (!atual) {
    return (
      <FimDeJogo
        titulo="Rodada concluída!"
        texto={`Você sabia ${sabia} de ${cartoes.length} de primeira.${repetidos.size > 0 ? ` ${repetidos.size} precisaram de mais uma volta.` : ""}`}
        acoes={acoes}
      />
    );
  }

  const feitos = cartoes.length - new Set(fila.map((c) => c.id)).size;

  return (
    <div>
      <Progresso feitos={feitos} total={cartoes.length} />

      <button
        type="button"
        onClick={() => {
          if (arrastou.current) return;
          setVirado((v) => !v);
        }}
        onPointerDown={(e) => {
          arrastou.current = false;
          if (!virado) return;
          inicio.current = e.clientX;
          setArrastando(true);
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (inicio.current === null) return;
          const dx = e.clientX - inicio.current;
          if (Math.abs(dx) > 8) arrastou.current = true;
          setArraste(dx);
        }}
        onPointerUp={() => {
          if (inicio.current === null) return;
          inicio.current = null;
          setArrastando(false);
          if (arraste >= LIMITE) responder(true);
          else if (arraste <= -LIMITE) responder(false);
          else setArraste(0);
        }}
        onPointerCancel={() => {
          inicio.current = null;
          setArrastando(false);
          setArraste(0);
        }}
        style={arraste ? { transform: `translateX(${arraste}px) rotate(${arraste / 25}deg)` } : undefined}
        aria-label={virado ? "Mostrar a frente do cartão" : "Virar o cartão"}
        className={`mt-5 flex min-h-64 w-full touch-pan-y flex-col items-center justify-center rounded-3xl border-2 p-8 text-center select-none ${
          !arrastando ? "transition-[transform,colors] duration-200 motion-reduce:transition-none" : ""
        } ${
          arraste >= LIMITE
            ? "border-certo bg-certo-fundo"
            : arraste <= -LIMITE
              ? "border-aviso bg-aviso-fundo"
              : virado
                ? "border-primaria bg-primaria-suave"
                : "border-linha bg-fundo hover:border-primaria"
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
        <p className="mt-3 text-center text-xs text-tinta-suave">Deslize para a direita se sabia e para a esquerda se ainda não.</p>
      )}
      {virado && (
        <div className="mt-3 flex justify-center gap-3">
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
