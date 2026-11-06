"use client";

import { fmt } from "@/i18n/config";
import { useDicionario } from "@/i18n/cliente";
import { useRef, useState } from "react";
import { BotaoSom } from "@/components/exercicios/BotaoSom";
import { tocarResultado } from "@/lib/som";
import { CartaoExercicio } from "@/components/exercicios/CartaoExercicio";
import { ConteudoExercicio } from "@/components/exercicios/AulaAtividade";
import type { Exercicio } from "@/lib/atividades/modelo";
import type { Resultado } from "@/lib/correcao";
import type { Andamento } from "@/lib/revisao";
import { responderRevisao } from "./actions";

export type GrupoRevisao = {
  atividadeId: string;
  atividadeTitulo: string;
  /** O exercício só com os itens devidos hoje. */
  exercicio: Exercicio;
  /** Id da linha de revisão de cada item. */
  revisaoPorItem: Record<string, number>;
};

/** Sessão do dia: conta só a primeira resposta de cada item. */
export function SessaoRevisao({ grupos }: { grupos: GrupoRevisao[] }) {
  const total = grupos.reduce((soma, g) => soma + g.exercicio.itens.length, 0);
  const tx = useDicionario().repasar;
  const respondidos = useRef(new Set<string>());
  const [resultados, setResultados] = useState<Record<string, Andamento & { acertou: boolean }>>({});
  const [falhou, setFalhou] = useState(false);

  const feitos = Object.values(resultados);
  const acertos = feitos.filter((r) => r.acertou).length;
  const dominados = feitos.filter((r) => r.concluida).length;

  function registrar(grupo: GrupoRevisao) {
    return (itemId: string) => async (resultado: Resultado) => {
      tocarResultado(resultado.status !== "errado");
      const id = grupo.revisaoPorItem[itemId];
      if (id === undefined || respondidos.current.has(itemId)) return;
      respondidos.current.add(itemId);
      const acertou = resultado.status !== "errado";
      const andamento = await responderRevisao(id, acertou);
      if (!andamento) return setFalhou(true);
      setResultados((atual) => ({ ...atual, [itemId]: { ...andamento, acertou } }));
    };
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 text-sm font-semibold text-tinta-suave">
        <span className="tabular-nums">
          {fmt(tx.repassados, { n: feitos.length, total })}
        </span>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-suave">
          <div
            className="h-full rounded-full bg-primaria transition-[width] duration-500 motion-reduce:transition-none"
            style={{ width: `${(feitos.length / total) * 100}%` }}
          />
        </div>
        <BotaoSom />
      </div>

      {falhou && (
        <p role="alert" className="rounded-xl bg-erro-fundo px-3.5 py-2.5 text-sm text-erro">
          {tx.falhou}
        </p>
      )}

      {grupos.map((grupo, i) => (
        <div key={grupo.exercicio.id}>
          <p className="mb-2 text-xs font-bold tracking-wide text-tinta-suave uppercase">{grupo.atividadeTitulo}</p>
          <CartaoExercicio
            numero={i + 1}
            titulo={grupo.exercicio.titulo}
            instrucoes={grupo.exercicio.instrucoes}
            midia={grupo.exercicio.midia}
          >
            <ConteudoExercicio exercicio={grupo.exercicio} anteriores={{}} registrar={registrar(grupo)} />
          </CartaoExercicio>
        </div>
      ))}

      {feitos.length === total && (
        <div role="status" className="rounded-2xl bg-primaria-suave p-5 text-center">
          <p className="text-lg font-extrabold">{tx.concluida}</p>
          <p className="mt-1 text-sm text-tinta-suave">
            {fmt(dominados === 0 ? tx.acertou : dominados === 1 ? tx.acertouDominou1 : tx.acertouDominouN, { acertos, total, n: dominados })}
          </p>
        </div>
      )}
    </div>
  );
}
