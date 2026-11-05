"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Cartao } from "@/lib/documento/cartoes";
import { montarMemoria } from "@/lib/documento/jogos";
import { tocarResultado } from "@/lib/som";
import { FimDeJogo, Progresso, type AcoesFim } from "./comum";

/** Tempo para ver as duas peças erradas antes de elas virarem de volta. */
const ESPERA_ERRO = 1100;

/**
 * Jogo da memória: cada par é um termo e a explicação dele (sem o termo).
 * Vira duas peças; se forem do mesmo par, ficam abertas.
 */
export function JogoMemoria({ cartoes, semente, acoes }: { cartoes: Cartao[]; semente: string; acoes: AcoesFim }) {
  const pecas = useMemo(() => montarMemoria(cartoes, semente), [cartoes, semente]);
  const [abertas, setAbertas] = useState<string[]>([]);
  const [achados, setAchados] = useState(new Set<string>());
  const [jogadas, setJogadas] = useState(0);
  const [errado, setErrado] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const totalPares = pecas.length / 2;

  function virar(id: string) {
    const peca = pecas.find((p) => p.id === id);
    if (!peca || achados.has(peca.par) || abertas.includes(id)) return;
    // Com duas erradas à mostra, um toque novo já fecha as duas e abre a nova.
    if (abertas.length === 2) {
      if (timer.current) clearTimeout(timer.current);
      setErrado(false);
      setAbertas([id]);
      return;
    }
    if (abertas.length === 0) {
      setAbertas([id]);
      return;
    }
    const primeira = pecas.find((p) => p.id === abertas[0])!;
    setJogadas((n) => n + 1);
    if (primeira.par === peca.par) {
      tocarResultado(true);
      setAchados((a) => new Set(a).add(peca.par));
      setAbertas([]);
    } else {
      tocarResultado(false);
      setAbertas([abertas[0], id]);
      setErrado(true);
      timer.current = setTimeout(() => {
        setAbertas([]);
        setErrado(false);
      }, ESPERA_ERRO);
    }
  }

  if (achados.size === totalPares) {
    return (
      <FimDeJogo
        titulo="Achou todos os pares!"
        texto={`Foram ${jogadas} jogadas para ${totalPares} pares.${jogadas <= totalPares + 2 ? " Que memória!" : ""}`}
        acoes={acoes}
      />
    );
  }

  return (
    <div>
      <Progresso feitos={achados.size} total={totalPares} extra={<span className="tabular-nums">{jogadas} jogadas</span>} />
      <p className="mt-3 text-sm text-tinta-suave">Vire duas peças. Ache cada termo e a explicação dele.</p>
      <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3">
        {pecas.map((p) => {
          const achado = achados.has(p.par);
          const aberta = achado || abertas.includes(p.id);
          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => virar(p.id)}
                disabled={achado}
                aria-label={aberta ? `${p.lado === "termo" ? "Termo" : "Explicação"}: ${p.texto}` : "Peça virada para baixo"}
                className={`flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-2xl border-2 p-1.5 text-center transition-[transform,colors] duration-200 motion-reduce:transition-none sm:aspect-square sm:p-2.5 ${
                  achado
                    ? "border-certo bg-certo-fundo"
                    : aberta
                      ? errado && abertas.length === 2
                        ? "border-aviso bg-aviso-fundo"
                        : "border-primaria bg-primaria-suave"
                      : "border-linha bg-suave hover:-translate-y-0.5 hover:border-primaria"
                }`}
              >
                {aberta ? (
                  <span
                    className={
                      p.lado === "termo"
                        ? "text-sm font-extrabold break-words sm:text-base"
                        : "text-[11px] leading-snug break-words sm:text-xs"
                    }
                  >
                    {p.texto}
                  </span>
                ) : (
                  <span aria-hidden className="text-2xl text-primaria">
                    ✦
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
