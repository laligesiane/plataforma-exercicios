"use client";

import { fmt } from "@/i18n/config";
import { useDicionario } from "@/i18n/cliente";
import { useEffect, useState } from "react";
import type { TelaLigar } from "@/lib/documento/jogos";
import { tocarResultado } from "@/lib/som";
import { Icone } from "./Icones";
import { FimDeJogo, Progresso, type AcoesFim } from "./comum";

const formatarTempo = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/**
 * Ligar pares contra o relógio: toca num termo e depois na explicação dele.
 * Cada tela tem até 5 pares; o cronômetro só conta, não acaba o jogo.
 */
export function JogoLigar({ telas, acoes }: { telas: TelaLigar[]; acoes: AcoesFim }) {
  const [tela, setTela] = useState(0);
  const [termo, setTermo] = useState<string | null>(null);
  const [ligados, setLigados] = useState(new Set<string>());
  const [errado, setErrado] = useState<string | null>(null);
  const [erros, setErros] = useState(0);
  const [segundos, setSegundos] = useState(0);
  const atual = telas[tela];
  const t = useDicionario().jogos;
  const total = telas.reduce((n, x) => n + x.termos.length, 0);
  const feitos = telas.slice(0, tela).reduce((n, x) => n + x.termos.length, 0) + ligados.size;

  useEffect(() => {
    if (!atual) return;
    const id = setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [atual]);

  useEffect(() => {
    if (!errado) return;
    const id = setTimeout(() => setErrado(null), 600);
    return () => clearTimeout(id);
  }, [errado]);

  if (!atual) {
    return (
      <FimDeJogo
        titulo={erros === 0 ? t.semErro : t.todosLigados}
        texto={`${fmt(t.paresEm, { total, tempo: formatarTempo(segundos) })}${erros ? (erros === 1 ? t.comErro1 : fmt(t.comErrosN, { n: erros })) : ""}${t.bater}`}
        acoes={acoes}
      />
    );
  }

  function escolherExplicacao(id: string) {
    if (!termo || ligados.has(id)) return;
    if (id === termo) {
      tocarResultado(true);
      const novos = new Set(ligados).add(id);
      setTermo(null);
      if (novos.size === atual.termos.length) {
        setTela((t) => t + 1);
        setLigados(new Set());
      } else {
        setLigados(novos);
      }
    } else {
      tocarResultado(false);
      setErrado(id);
      setErros((n) => n + 1);
    }
  }

  const base = "w-full rounded-2xl border-2 px-3 py-2.5 text-left transition-colors";

  return (
    <div>
      <Progresso feitos={feitos} total={total} extra={<span className="inline-flex items-center gap-1 tabular-nums"><Icone nome="relogio" className="size-4" /> {formatarTempo(segundos)}</span>} />
      <p className="mt-3 text-sm text-tinta-suave">{t.toqueTermo}</p>
      <div className="mt-4 grid grid-cols-[2fr_3fr] gap-2 sm:gap-3">
        <ul className="space-y-2">
          {atual.termos.map((tm) => {
            const feito = ligados.has(tm.id);
            return (
              <li key={tm.id}>
                <button
                  type="button"
                  onClick={() => setTermo(tm.id)}
                  disabled={feito}
                  aria-pressed={termo === tm.id}
                  className={`${base} text-sm font-extrabold ${
                    feito
                      ? "border-certo bg-certo-fundo text-certo opacity-60"
                      : termo === tm.id
                        ? "border-primaria bg-primaria text-white"
                        : "border-linha bg-fundo hover:border-primaria"
                  }`}
                >
                  {tm.texto}
                </button>
              </li>
            );
          })}
        </ul>
        <ul className="space-y-2">
          {atual.explicacoes.map((e) => {
            const feito = ligados.has(e.id);
            return (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => escolherExplicacao(e.id)}
                  disabled={feito || !termo}
                  className={`${base} text-xs leading-snug sm:text-sm ${
                    feito
                      ? "border-certo bg-certo-fundo opacity-60"
                      : errado === e.id
                        ? "border-erro bg-erro-fundo"
                        : termo
                          ? "border-linha bg-fundo hover:border-primaria"
                          : "border-linha bg-fundo"
                  }`}
                >
                  {e.texto}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
