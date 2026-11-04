"use client";

import { useState } from "react";
import type { Resultado } from "@/lib/correcao";
import { lacunasDemo, multiplaEscolhaDemo } from "@/lib/exemplos/demo";
import { CartaoExercicio } from "./CartaoExercicio";
import { Lacuna } from "./Lacuna";
import { MultiplaEscolha } from "./MultiplaEscolha";

const totalItens = lacunasDemo.length + multiplaEscolhaDemo.length;

export function AulaDemo() {
  const [resultados, setResultados] = useState<Record<string, Resultado>>({});
  const acertos = Object.values(resultados).filter((r) => r.status !== "errado").length;

  function registrar(chave: string) {
    return (resultado: Resultado) => setResultados((atual) => ({ ...atual, [chave]: resultado }));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 text-sm font-semibold text-tinta-suave">
        <span className="tabular-nums">
          {acertos} de {totalItens} certos
        </span>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-suave">
          <div
            className="h-full rounded-full bg-primaria transition-[width] duration-500 motion-reduce:transition-none"
            style={{ width: `${(acertos / totalItens) * 100}%` }}
          />
        </div>
      </div>

      <CartaoExercicio numero={1} titulo="Complete as frases" instrucoes="Escreva a palavra que falta e aperte Enter.">
        {lacunasDemo.map((item) => (
          <Lacuna key={item.enunciado} item={item} onResultado={registrar(item.enunciado)} />
        ))}
      </CartaoExercicio>

      <CartaoExercicio numero={2} titulo="Escolha a preposição" instrucoes="Clique na alternativa correta.">
        {multiplaEscolhaDemo.map((item) => (
          <MultiplaEscolha key={item.enunciado} item={item} onResultado={registrar(item.enunciado)} />
        ))}
      </CartaoExercicio>
    </div>
  );
}
