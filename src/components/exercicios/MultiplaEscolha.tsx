"use client";

import { useState } from "react";
import { corrigirMultiplaEscolha, type ItemMultiplaEscolha, type Resultado } from "@/lib/correcao";
import { Feedback } from "./Feedback";

export function MultiplaEscolha({ item }: { item: ItemMultiplaEscolha }) {
  const [escolhida, setEscolhida] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  function escolher(id: string) {
    setEscolhida(id);
    setResultado(corrigirMultiplaEscolha(item, id));
  }

  return (
    <div className="py-3">
      <p>{item.enunciado}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {item.alternativas.map((a) => (
          <button
            key={a.id}
            onClick={() => escolher(a.id)}
            className={`rounded border px-3 py-1 ${escolhida === a.id ? "border-blue-600 bg-blue-50 dark:bg-blue-950" : "border-gray-300 dark:border-gray-700"}`}
          >
            {a.texto}
          </button>
        ))}
      </div>
      <Feedback resultado={resultado} />
    </div>
  );
}
