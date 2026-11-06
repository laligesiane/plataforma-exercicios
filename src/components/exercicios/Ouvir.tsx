"use client";

import { fmt } from "../../i18n/config";
import { useDicionario } from "../../i18n/cliente";
import { createContext, useContext, useEffect, useState } from "react";
import { melhorVoz } from "../../lib/fala";

const vozes: Record<string, string> = { es: "es-ES", en: "en-US", fr: "fr-FR", it: "it-IT", de: "de-DE", pt: "pt-BR" };

/** Idioma ensinado na atividade, ou "pt" nas de outras matérias. Sem ele, o botão de ouvir não aparece. */
export const IdiomaFala = createContext<string | null>(null);

/** Texto pronto para ler: a lacuna vira a resposta, quando já se sabe, ou uma pausa. */
export function textoParaFala(enunciado: string, resposta?: string) {
  return enunciado.replace(/_{3,}/g, resposta?.trim() ? resposta : "…").replace(/\s+/g, " ").trim();
}

/** Lê o texto com a voz do próprio navegador, no idioma da atividade. Não grava nem envia nada. */
export function Ouvir({ texto }: { texto: string }) {
  const tx = useDicionario().exercicio;
  const idioma = useContext(IdiomaFala);
  const [disponivel, setDisponivel] = useState(false);
  useEffect(() => setDisponivel(typeof window !== "undefined" && "speechSynthesis" in window), []);
  if (!idioma || !vozes[idioma] || !disponivel || !texto.trim()) return null;

  function falar() {
    const fala = new SpeechSynthesisUtterance(texto);
    fala.lang = vozes[idioma!];
    fala.rate = 0.9;
    // A voz mais natural do aparelho nesse idioma (as neurais primeiro, as robóticas por último).
    const voz = melhorVoz(speechSynthesis.getVoices(), vozes[idioma!]);
    if (voz) {
      fala.voice = voz;
      fala.lang = voz.lang;
    }
    speechSynthesis.cancel();
    speechSynthesis.speak(fala);
  }

  return (
    <button
      type="button"
      onClick={falar}
      title={tx.ouvir}
      aria-label={fmt(tx.ouvirX, { texto })}
      className="ml-1 inline-flex size-7 shrink-0 items-center justify-center rounded-full align-middle text-base text-tinta-suave transition-colors hover:bg-suave hover:text-primaria"
    >
      <svg aria-hidden viewBox="0 0 24 24" className="size-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 5 6 9H3v6h3l5 4V5z" />
        <path d="M15.5 8.5a5 5 0 0 1 0 7" />
        <path d="M18.5 5.5a9 9 0 0 1 0 13" />
      </svg>
    </button>
  );
}
