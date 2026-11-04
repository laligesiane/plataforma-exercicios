"use client";

import { useState } from "react";
import { corrigir, type Resultado } from "@/lib/correcao";
import type { Exercicio } from "@/lib/atividades/modelo";
import { CartaoExercicio } from "./CartaoExercicio";
import { Lacuna } from "./Lacuna";
import { MultiplaEscolha } from "./MultiplaEscolha";

export type RespostaDada = { exercicioId: string; itemId: string; valor: string; status: Resultado["status"] };

type Props = {
  exercicios: Exercicio[];
  /** Última resposta de cada item (por id do item), para retomar de onde parou. */
  respostasAnteriores?: Record<string, string>;
  onResposta?: (resposta: RespostaDada) => void;
};

export function AulaAtividade({ exercicios, respostasAnteriores = {}, onResposta }: Props) {
  const totalItens = exercicios.reduce((soma, e) => soma + e.itens.length, 0);
  const [certos, setCertos] = useState(() => contarAnteriores(exercicios, respostasAnteriores));
  const acertos = Object.values(certos).filter(Boolean).length;

  function registrar(exercicioId: string, itemId: string) {
    return (resultado: Resultado, valor: string) => {
      setCertos((atual) => ({ ...atual, [itemId]: resultado.status !== "errado" }));
      onResposta?.({ exercicioId, itemId, valor, status: resultado.status });
    };
  }

  if (totalItens === 0) {
    return <p className="text-tinta-suave">Esta atividade ainda não tem exercícios.</p>;
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

      {exercicios.map((exercicio, i) => (
        <CartaoExercicio key={exercicio.id} numero={i + 1} titulo={exercicio.titulo} instrucoes={exercicio.instrucoes}>
          {exercicio.tipo === "lacuna"
            ? exercicio.itens.map((item) => (
                <Lacuna
                  key={item.id}
                  item={item}
                  valorInicial={respostasAnteriores[item.id]}
                  onResultado={registrar(exercicio.id, item.id)}
                />
              ))
            : exercicio.itens.map((item) => (
                <MultiplaEscolha
                  key={item.id}
                  item={item}
                  valorInicial={respostasAnteriores[item.id]}
                  onResultado={registrar(exercicio.id, item.id)}
                />
              ))}
        </CartaoExercicio>
      ))}
    </div>
  );
}

/** Acertos das respostas que vieram do banco, sem gravá-las de novo. */
function contarAnteriores(exercicios: Exercicio[], anteriores: Record<string, string>) {
  const certos: Record<string, boolean> = {};
  for (const exercicio of exercicios) {
    for (const item of exercicio.itens) {
      const valor = anteriores[item.id];
      if (valor !== undefined) certos[item.id] = corrigir(item, valor).status !== "errado";
    }
  }
  return certos;
}
