"use client";

import { useState } from "react";
import { corrigirMultiplaEscolha, type ItemMultiplaEscolha, type Resultado } from "@/lib/correcao";
import { Feedback } from "./Feedback";

type Props = {
  item: ItemMultiplaEscolha;
  /** Id da última alternativa escolhida, para retomar a atividade. */
  valorInicial?: string;
  onResultado?: (resultado: Resultado, valor: string) => void;
};

export function MultiplaEscolha({ item, valorInicial, onResultado }: Props) {
  const [escolhida, setEscolhida] = useState<string | null>(valorInicial ?? null);
  const [resultado, setResultado] = useState<Resultado | null>(() =>
    valorInicial ? corrigirMultiplaEscolha(item, valorInicial) : null,
  );

  function escolher(id: string) {
    const novo = corrigirMultiplaEscolha(item, id);
    setEscolhida(id);
    setResultado(novo);
    onResultado?.(novo, id);
  }

  function estilo(id: string) {
    if (id !== escolhida || !resultado) return "border-linha bg-fundo hover:border-primaria";
    return resultado.status === "errado" ? "border-erro bg-erro-fundo text-erro" : "border-certo bg-certo-fundo text-certo";
  }

  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <p className="text-[17px]">{item.enunciado}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {item.alternativas.map((a) => (
          <button
            key={a.id}
            onClick={() => escolher(a.id)}
            aria-pressed={escolhida === a.id}
            className={`min-w-15 rounded-full border-2 px-5 py-2 font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria ${estilo(a.id)}`}
          >
            {a.texto}
          </button>
        ))}
      </div>
      <Feedback resultado={resultado} />
    </div>
  );
}
