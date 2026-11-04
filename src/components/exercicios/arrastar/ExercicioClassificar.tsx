"use client";

import { useMemo, useState } from "react";
import { corrigirClassificar, type Resultado } from "@/lib/correcao";
import type { ExercicioClassificar as Tipo } from "@/lib/atividades/modelo";
import { embaralhar } from "@/lib/embaralhar";
import { Feedback } from "../Feedback";
import { Alvo, AreaArrastar, ConteudoCartao, Peca } from "./base";

type Props = {
  exercicio: Tipo;
  anteriores: Record<string, string>;
  onResultado: (itemId: string, resultado: Resultado, valor: string) => void;
};

export function ExercicioClassificar({ exercicio, anteriores, onResultado }: Props) {
  const cartoes = useMemo(() => embaralhar(exercicio.itens, exercicio.id), [exercicio]);
  const [certos, setCertos] = useState<Set<string>>(
    () => new Set(exercicio.itens.filter((i) => anteriores[i.id] === i.colunaId).map((i) => i.id)),
  );
  const [ultimo, setUltimo] = useState<{ itemId: string; resultado: Resultado; coluna: string } | null>(null);
  const [selecionado, setSelecionado] = useState<string | null>(null);

  function colocar(itemId: string, colunaId: string) {
    const item = exercicio.itens.find((i) => i.id === itemId);
    const coluna = exercicio.colunas.find((c) => c.id === colunaId);
    if (!item || !coluna || certos.has(itemId)) return;
    const resultado = corrigirClassificar(item, colunaId);
    if (resultado.status === "certo") setCertos((c) => new Set(c).add(itemId));
    setUltimo({ itemId, resultado, coluna: coluna.nome });
    setSelecionado(null);
    onResultado(itemId, resultado, colunaId);
  }

  const soltos = cartoes.filter((c) => !certos.has(c.id));
  const errado = ultimo?.resultado.status === "errado" ? ultimo.itemId : null;
  const textoUltimo = ultimo && exercicio.itens.find((i) => i.id === ultimo.itemId)?.texto;

  return (
    <AreaArrastar onSoltar={colocar}>
      <div className="flex min-h-14 flex-wrap items-center gap-2 rounded-2xl bg-suave p-3" aria-label="Cartões para classificar">
        {soltos.length > 0 ? (
          soltos.map((c) => (
            <Peca
              key={c.id}
              id={c.id}
              cartao={Boolean(c.imagem)}
              estado={selecionado === c.id ? "selecionada" : errado === c.id ? "errada" : "normal"}
              onToque={() => setSelecionado((s) => (s === c.id ? null : c.id))}
            >
              <ConteudoCartao texto={c.texto} imagem={c.imagem} />
            </Peca>
          ))
        ) : (
          <span className="px-1 py-1.5 text-sm font-semibold text-certo">Tudo classificado!</span>
        )}
      </div>

      {ultimo && (
        <div className="mt-1">
          <Feedback
            resultado={
              ultimo.resultado.status === "errado"
                ? { ...ultimo.resultado, explicacao: `"${textoUltimo}" não vai em ${ultimo.coluna}. ${ultimo.resultado.explicacao}` }
                : ultimo.resultado
            }
          />
        </div>
      )}

      <div className={`mt-4 grid gap-3 ${exercicio.colunas.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
        {exercicio.colunas.map((coluna) => (
          <Alvo
            key={coluna.id}
            id={coluna.id}
            rotulo={`Coluna ${coluna.nome}`}
            onToque={selecionado ? () => colocar(selecionado, coluna.id) : undefined}
            className={`min-h-32 rounded-2xl border-2 p-3 transition-colors ${selecionado ? "cursor-pointer border-dashed border-primaria" : "border-linha"}`}
          >
            <p className="mb-2 text-center font-extrabold">{coluna.nome}</p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {exercicio.itens
                .filter((i) => i.colunaId === coluna.id && certos.has(i.id))
                .map((i) => (
                  <span
                    key={i.id}
                    className={`border-2 border-certo bg-certo-fundo text-sm font-bold text-certo ${i.imagem ? "rounded-xl p-1" : "rounded-full px-3 py-1"}`}
                  >
                    <ConteudoCartao texto={i.texto} imagem={i.imagem} pequena />
                  </span>
                ))}
            </div>
          </Alvo>
        ))}
      </div>
    </AreaArrastar>
  );
}
