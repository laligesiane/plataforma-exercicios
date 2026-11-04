"use client";

import { useState } from "react";
import { corrigirLacuna, podeVerResposta, respostaCorreta, type ItemLacuna, type Resultado } from "@/lib/correcao";
import { Feedback } from "./Feedback";

export function Lacuna({ item }: { item: ItemLacuna }) {
  const [valor, setValor] = useState("");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [erros, setErros] = useState(0);
  const [mostrarResposta, setMostrarResposta] = useState(false);

  function conferir() {
    if (valor.trim() === "") return;
    const novo = corrigirLacuna(item, valor);
    setResultado(novo);
    if (novo.status === "errado") setErros((n) => n + 1);
  }

  const [antes, depois] = item.enunciado.split("___");

  return (
    <div className="py-3">
      <p className="leading-loose">
        {antes}
        <input
          value={valor}
          onChange={(e) => {
            setValor(e.target.value);
            setResultado(null);
          }}
          onBlur={conferir}
          onKeyDown={(e) => e.key === "Enter" && conferir()}
          aria-label="Resposta"
          className="mx-1 w-32 border-b-2 border-current bg-transparent px-1 text-center outline-none focus:border-blue-600"
        />
        {depois}
      </p>
      <Feedback resultado={resultado} />
      {resultado?.status === "errado" && podeVerResposta(erros) && (
        <button onClick={() => setMostrarResposta(true)} className="mt-1 text-sm underline">
          {mostrarResposta ? `Resposta: ${respostaCorreta(item)}` : "Ver resposta"}
        </button>
      )}
    </div>
  );
}
