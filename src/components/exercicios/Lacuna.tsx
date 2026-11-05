"use client";

import { useState } from "react";
import { corrigirLacuna, podeVerResposta, respostaCorreta, type ItemLacuna, type Resultado } from "@/lib/correcao";
import { Dica } from "./Dica";
import { Feedback } from "./Feedback";
import { Ouvir, textoParaFala } from "./Ouvir";

const estiloPorStatus = {
  certo: "border-certo bg-certo-fundo text-certo",
  certo_com_aviso: "border-aviso bg-aviso-fundo text-aviso",
  errado: "border-erro bg-erro-fundo text-erro",
} as const;

type Props = {
  item: ItemLacuna;
  /** Última resposta já dada, para retomar a atividade. */
  valorInicial?: string;
  onResultado?: (resultado: Resultado, valor: string) => void;
};

export function Lacuna({ item, valorInicial, onResultado }: Props) {
  const [valor, setValor] = useState(valorInicial ?? "");
  const [resultado, setResultado] = useState<Resultado | null>(() =>
    valorInicial ? corrigirLacuna(item, valorInicial) : null,
  );
  const [erros, setErros] = useState(() => (resultado?.status === "errado" ? 1 : 0));
  const [mostrarResposta, setMostrarResposta] = useState(false);

  function conferir() {
    if (valor.trim() === "" || resultado) return;
    const novo = corrigirLacuna(item, valor);
    setResultado(novo);
    onResultado?.(novo, valor);
    if (novo.status === "errado") setErros((n) => n + 1);
  }

  const [antes, depois] = item.enunciado.split("___");
  const estilo = resultado
    ? estiloPorStatus[resultado.status]
    : "border-linha bg-suave focus:border-primaria focus:bg-fundo";

  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <p className="text-[17px] leading-[2.1]">
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
          autoComplete="off"
          spellCheck={false}
          className={`mx-1 w-32 rounded-[10px] border-2 px-2 py-0.5 text-center font-bold outline-none transition-colors ${estilo}`}
        />
        {depois}
        <Ouvir texto={textoParaFala(item.enunciado, resultado && resultado.status !== "errado" ? valor : undefined)} />
      </p>
      {resultado?.status !== "certo" && resultado?.status !== "certo_com_aviso" && <Dica texto={item.dica} />}
      <Feedback resultado={resultado} />
      {resultado?.status === "errado" && podeVerResposta(erros) && (
        <button
          onClick={() => setMostrarResposta(true)}
          className="mt-2 text-sm font-bold text-primaria underline-offset-4 hover:underline"
        >
          {mostrarResposta ? `Resposta: ${respostaCorreta(item)}` : "Ver resposta"}
        </button>
      )}
    </div>
  );
}
