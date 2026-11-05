"use client";

import { useEffect, useState } from "react";
import type { Secao } from "@/lib/documento";

/** A seção que está sendo lida: o último título que já passou do topo da tela (com uma folga). */
function useSecaoAtual(secoes: Secao[]) {
  const [atual, setAtual] = useState(secoes[0]?.id);

  useEffect(() => {
    const alvos = secoes.flatMap((s) => document.getElementById(s.id) ?? []);
    if (!alvos.length) return;
    const aoRolar = () => {
      let ultimo = alvos[0].id;
      for (const el of alvos) if (el.getBoundingClientRect().top <= 120) ultimo = el.id;
      setAtual(ultimo);
    };
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, [secoes]);

  return atual;
}

function Lista({ secoes, atual, aoEscolher }: { secoes: Secao[]; atual?: string; aoEscolher?: () => void }) {
  return (
    <ol className="mt-2 space-y-1">
      {secoes.map((s) => (
        <li key={s.id} className={s.nivel === 3 ? "pl-4 text-sm" : "font-bold"}>
          <a
            href={`#${s.id}`}
            onClick={aoEscolher}
            aria-current={atual === s.id ? "location" : undefined}
            className="-mx-2 block rounded-lg px-2 py-1 hover:text-primaria aria-[current]:bg-primaria-suave aria-[current]:text-primaria"
          >
            {s.texto}
          </a>
        </li>
      ))}
    </ol>
  );
}

/** Sumário do resumo. Na tela larga fica fixo ao lado do texto e marca a seção que está sendo lida. */
export function Sumario({ secoes }: { secoes: Secao[] }) {
  const atual = useSecaoAtual(secoes);
  return (
    <nav aria-label="Sumário" className="rounded-2xl bg-suave p-5 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
      <h2 className="text-sm font-bold tracking-wide text-tinta-suave uppercase">Neste resumo</h2>
      <Lista secoes={secoes} atual={atual} />
    </nav>
  );
}

/**
 * Sumário do celular e do tablet: uma faixa fina presa no topo com a seção atual.
 * Tocando nela, a lista abre por cima do texto, sem empurrar o resumo para baixo.
 */
export function SumarioCompacto({ secoes }: { secoes: Secao[] }) {
  const atual = useSecaoAtual(secoes);
  const [aberto, setAberto] = useState(false);
  const titulo = secoes.find((s) => s.id === atual)?.texto ?? secoes[0]?.texto;

  return (
    <nav aria-label="Sumário" className="sticky top-0 z-30 -mx-4 mb-4 bg-fundo/95 px-4 py-2 backdrop-blur lg:hidden print:hidden">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        className="flex w-full items-center gap-2 rounded-2xl bg-suave px-4 py-2.5 text-left"
      >
        <span className="shrink-0 text-xs font-bold tracking-wide text-tinta-suave uppercase">Neste resumo</span>
        <span className="min-w-0 flex-1 truncate font-bold">{titulo}</span>
        <svg viewBox="0 0 24 24" className={`size-5 shrink-0 transition-transform ${aberto ? "rotate-180" : ""}`} aria-hidden fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {aberto && (
        <div className="absolute inset-x-4 top-full max-h-[60vh] overflow-y-auto rounded-2xl border border-linha bg-fundo p-4 shadow-xl">
          <Lista secoes={secoes} atual={atual} aoEscolher={() => setAberto(false)} />
        </div>
      )}
    </nav>
  );
}
