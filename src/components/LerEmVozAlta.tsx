"use client";

import { useEffect, useState } from "react";

/** Lê o resumo em voz alta com a voz do navegador. Nada é gravado nem enviado. */
export function LerEmVozAlta({ texto, idioma = "pt-BR" }: { texto: string; idioma?: string }) {
  const [disponivel, setDisponivel] = useState(false);
  const [estado, setEstado] = useState<"parado" | "lendo" | "pausado">("parado");

  useEffect(() => {
    setDisponivel("speechSynthesis" in window);
    return () => {
      if ("speechSynthesis" in window) speechSynthesis.cancel();
    };
  }, []);
  if (!disponivel || !texto.trim()) return null;

  function ler() {
    if (estado === "pausado") {
      speechSynthesis.resume();
      return setEstado("lendo");
    }
    if (estado === "lendo") {
      speechSynthesis.pause();
      return setEstado("pausado");
    }
    speechSynthesis.cancel();
    const fala = new SpeechSynthesisUtterance(texto);
    fala.lang = idioma;
    fala.rate = 0.95;
    fala.onend = () => setEstado("parado");
    fala.onerror = () => setEstado("parado");
    speechSynthesis.speak(fala);
    setEstado("lendo");
  }

  return (
    <span className="inline-flex items-baseline gap-3">
      <button type="button" onClick={ler} className="text-sm font-bold text-primaria hover:underline">
        {estado === "lendo" ? "⏸ Pausar leitura" : estado === "pausado" ? "▶ Continuar" : "🔊 Ouvir o resumo"}
      </button>
      {estado !== "parado" && (
        <button
          type="button"
          onClick={() => {
            speechSynthesis.cancel();
            setEstado("parado");
          }}
          className="text-sm font-bold text-tinta-suave hover:text-tinta"
        >
          Parar
        </button>
      )}
    </span>
  );
}
