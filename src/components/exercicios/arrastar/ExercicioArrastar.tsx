"use client";

import { useMemo, useState } from "react";
import { corrigirArrastar, podeVerResposta, type Resultado } from "@/lib/correcao";
import type { ExercicioArrastar as Tipo } from "@/lib/atividades/modelo";
import { embaralhar } from "@/lib/embaralhar";
import { Dica } from "../Dica";
import { Feedback } from "../Feedback";
import { Ouvir, textoParaFala } from "../Ouvir";
import { Alvo, AreaArrastar, Peca } from "./base";

type Props = {
  exercicio: Tipo;
  anteriores: Record<string, string>;
  onResultado: (itemId: string, resultado: Resultado, valor: string) => void;
};

type Estado = { palavra: string; resultado: Resultado; erros: number };

export function ExercicioArrastar({ exercicio, anteriores, onResultado }: Props) {
  // Banco: as respostas de todos os itens e as palavras extras, numa ordem fixa por exercício.
  const banco = useMemo(
    () =>
      embaralhar(
        [...exercicio.itens.map((i) => i.resposta), ...exercicio.palavrasExtras].map((palavra, n) => ({ id: `p${n}`, palavra })),
        exercicio.id,
      ),
    [exercicio],
  );

  const [estados, setEstados] = useState<Record<string, Estado>>(() => {
    const inicial: Record<string, Estado> = {};
    for (const item of exercicio.itens) {
      const valor = anteriores[item.id];
      if (valor === undefined) continue;
      const resultado = corrigirArrastar(item, valor);
      inicial[item.id] = { palavra: valor, resultado, erros: resultado.status === "errado" ? 1 : 0 };
    }
    return inicial;
  });
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [verResposta, setVerResposta] = useState<Record<string, boolean>>({});

  // Cada palavra certa colocada sai do banco (uma ocorrência por acerto).
  const usadas = new Set<string>();
  for (const item of exercicio.itens) {
    const e = estados[item.id];
    if (e?.resultado.status !== "certo") continue;
    const peca = banco.find((p) => !usadas.has(p.id) && p.palavra === e.palavra);
    if (peca) usadas.add(peca.id);
  }
  const disponiveis = banco.filter((p) => !usadas.has(p.id));

  function colocar(pecaId: string, itemId: string) {
    const peca = banco.find((p) => p.id === pecaId);
    const item = exercicio.itens.find((i) => i.id === itemId);
    if (!peca || !item || estados[itemId]?.resultado.status === "certo") return;
    const resultado = corrigirArrastar(item, peca.palavra);
    setEstados((atual) => ({
      ...atual,
      [itemId]: {
        palavra: peca.palavra,
        resultado,
        erros: (atual[itemId]?.erros ?? 0) + (resultado.status === "errado" ? 1 : 0),
      },
    }));
    setSelecionada(null);
    onResultado(itemId, resultado, peca.palavra);
  }

  return (
    <AreaArrastar onSoltar={colocar}>
      <div className="mb-2 flex flex-wrap gap-2 rounded-2xl bg-suave p-3" aria-label="Banco de palavras">
        {disponiveis.length > 0 ? (
          disponiveis.map((p) => (
            <Peca
              key={p.id}
              id={p.id}
              estado={selecionada === p.id ? "selecionada" : "normal"}
              onToque={() => setSelecionada((s) => (s === p.id ? null : p.id))}
            >
              {p.palavra}
            </Peca>
          ))
        ) : (
          <span className="px-1 text-sm font-semibold text-tinta-suave">Todas as palavras foram usadas.</span>
        )}
      </div>

      <div className="divide-y divide-linha">
      {exercicio.itens.map((item) => {
        const [antes, depois] = item.enunciado.split("___");
        const estado = estados[item.id];
        const status = estado?.resultado.status;
        const cor =
          status === "certo"
            ? "border-certo bg-certo-fundo text-certo"
            : status === "errado"
              ? "border-erro bg-erro-fundo text-erro"
              : selecionada
                ? "border-primaria border-dashed bg-fundo cursor-pointer"
                : "border-linha border-dashed bg-suave";
        return (
          <div key={item.id} className="py-4 first:pt-2 last:pb-0">
            <p className="text-[17px] leading-[2.4]">
              {antes}
              <Alvo
                id={item.id}
                inline
                rotulo={estado ? `Lacuna com "${estado.palavra}"` : "Lacuna vazia"}
                onToque={selecionada && status !== "certo" ? () => colocar(selecionada, item.id) : undefined}
                className={`mx-1 inline-flex min-w-24 items-center justify-center rounded-[10px] border-2 px-3 py-0.5 align-middle leading-normal font-bold transition-colors ${cor}`}
              >
                {estado?.palavra ?? " "}
              </Alvo>
              {depois}
              <Ouvir texto={textoParaFala(item.enunciado, status && status !== "errado" ? estado?.palavra : undefined)} />
            </p>
            {status !== "certo" && status !== "certo_com_aviso" && <Dica texto={item.dica} />}
            <Feedback resultado={estado?.resultado ?? null} />
            {status === "errado" && podeVerResposta(estado.erros) && (
              <button
                onClick={() => setVerResposta((v) => ({ ...v, [item.id]: true }))}
                className="mt-2 text-sm font-bold text-primaria underline-offset-4 hover:underline"
              >
                {verResposta[item.id] ? `Resposta: ${item.resposta}` : "Ver resposta"}
              </button>
            )}
          </div>
        );
      })}
      </div>
    </AreaArrastar>
  );
}
