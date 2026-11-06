"use client";

import { fmt } from "@/i18n/config";
import { useDicionario } from "@/i18n/cliente";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Cartao } from "@/lib/documento/cartoes";
import { montarMemoria } from "@/lib/documento/jogos";
import { tocarResultado } from "@/lib/som";
import { Icone } from "./Icones";
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
  const t = useDicionario().jogos;
  // Com explicações compridas, duas colunas no celular para a frase caber inteira sem ficar miúda.
  const longas = pecas.some((p) => p.texto.length > 70);

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
        titulo={t.achouTodos}
        texto={`${fmt(t.jogadasTexto, { jogadas, pares: totalPares })}${jogadas <= totalPares + 2 ? t.queMemoria : ""}`}
        acoes={acoes}
      />
    );
  }

  return (
    <div>
      <Progresso feitos={achados.size} total={totalPares} extra={<span className="tabular-nums">{fmt(t.jogadas, { n: jogadas })}</span>} />
      <p className="mt-3 text-sm text-tinta-suave">{t.vireDuas}</p>
      <ul className={`mt-4 grid gap-2 sm:grid-cols-3 sm:gap-3 ${longas ? "grid-cols-2" : "grid-cols-3"}`}>
        {pecas.map((p) => {
          const achado = achados.has(p.par);
          const aberta = achado || abertas.includes(p.id);
          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => virar(p.id)}
                disabled={achado}
                aria-label={aberta ? `${p.lado === "termo" ? t.termo : t.explicacao}: ${p.texto}` : t.pecaVirada}
                className={`flex h-full min-h-28 w-full items-center justify-center rounded-2xl border-2 p-2 text-center transition-[transform,colors] duration-200 motion-reduce:transition-none sm:min-h-32 sm:p-3 ${
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
                        ? `font-extrabold break-words hyphens-auto ${p.texto.length > 30 ? "text-xs sm:text-sm" : "text-sm sm:text-base"}`
                        : `leading-snug break-words hyphens-auto ${p.texto.length > 110 ? "text-[11px] sm:text-xs" : "text-xs sm:text-sm"}`
                    }
                  >
                    {p.texto}
                  </span>
                ) : (
                  <Icone nome="brilho" className="size-6 text-primaria" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
