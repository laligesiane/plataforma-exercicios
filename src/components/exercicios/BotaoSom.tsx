"use client";

import { useDicionario } from "@/i18n/cliente";
import { useEffect, useState } from "react";
import { EVENTO_SONS, ligarSons, somDeAcerto, sonsLigados } from "@/lib/som";

/** Liga e desliga os sons de acerto e erro. Vale para todas as atividades neste aparelho. */
export function BotaoSom() {
  const tx = useDicionario().exercicio;
  const [ligado, setLigado] = useState(true);
  useEffect(() => {
    setLigado(sonsLigados());
    const aoMudar = (e: Event) => setLigado((e as CustomEvent<boolean>).detail);
    window.addEventListener(EVENTO_SONS, aoMudar);
    return () => window.removeEventListener(EVENTO_SONS, aoMudar);
  }, []);

  return (
    <button
      type="button"
      onClick={() => {
        ligarSons(!ligado);
        if (!ligado) somDeAcerto();
      }}
      aria-pressed={ligado}
      title={ligado ? tx.silenciar : tx.ligar}
      aria-label={ligado ? tx.silenciarLongo : tx.ligarLongo}
      className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-tinta-suave transition-colors hover:bg-suave hover:text-tinta"
    >
      <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 5 6 9H3v6h3l5 4V5z" />
        {ligado ? (
          <>
            <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            <path d="M18.5 5.5a9 9 0 0 1 0 13" />
          </>
        ) : (
          <path d="m16 9 5 6m0-6-5 6" />
        )}
      </svg>
    </button>
  );
}
