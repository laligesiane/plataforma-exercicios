"use client";

import { useState } from "react";
import { AulaAtividade, type RespostaDada } from "@/components/exercicios/AulaAtividade";
import type { Exercicio } from "@/lib/atividades/modelo";
import { registrarResposta } from "../actions";

type Props = {
  atividadeId: string;
  exercicios: Exercicio[];
  respostasAnteriores: Record<string, string>;
  salvar: boolean;
};

export function ResolverAtividade({ atividadeId, exercicios, respostasAnteriores, salvar }: Props) {
  const [falhou, setFalhou] = useState(false);

  async function aoResponder(r: RespostaDada) {
    if (!salvar) return;
    const ok = await registrarResposta({ atividadeId, ...r });
    setFalhou(!ok);
  }

  return (
    <>
      {falhou && (
        <p role="alert" className="mb-4 rounded-xl bg-erro-fundo px-3.5 py-2.5 text-sm text-erro">
          Não conseguimos salvar sua última resposta. Confira sua conexão; a correção continua funcionando.
        </p>
      )}
      <AulaAtividade exercicios={exercicios} respostasAnteriores={respostasAnteriores} onResposta={aoResponder} />
    </>
  );
}
