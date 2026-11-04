"use client";

import { useState } from "react";
import { AulaAtividade, type RespostaDada } from "@/components/exercicios/AulaAtividade";
import type { Exercicio } from "@/lib/atividades/modelo";
import type { ResumoAtividade } from "@/lib/atividades/resumo";
import { registrarEnvio, registrarResposta } from "../actions";

type Props = {
  atividadeId: string;
  exercicios: Exercicio[];
  respostasAnteriores: Record<string, string>;
  primeirasAnteriores: Record<string, boolean>;
  salvar: boolean;
};

export function ResolverAtividade({ atividadeId, exercicios, respostasAnteriores, primeirasAnteriores, salvar }: Props) {
  const [falhou, setFalhou] = useState(false);

  async function aoResponder(r: RespostaDada) {
    if (!salvar) return;
    const ok = await registrarResposta({ atividadeId, ...r });
    setFalhou(!ok);
  }

  async function aoEnviar(r: ResumoAtividade) {
    if (!salvar) return;
    const ok = await registrarEnvio({ atividadeId, certos: r.certos, dePrimeira: r.dePrimeira, total: r.total });
    setFalhou(!ok);
  }

  return (
    <>
      {falhou && (
        <p role="alert" className="mb-4 rounded-xl bg-erro-fundo px-3.5 py-2.5 text-sm text-erro">
          Não conseguimos salvar sua última resposta ou envio. Confira sua conexão; a correção continua funcionando.
        </p>
      )}
      <AulaAtividade
        exercicios={exercicios}
        respostasAnteriores={respostasAnteriores}
        primeirasAnteriores={primeirasAnteriores}
        onResposta={aoResponder}
        onEnviar={aoEnviar}
      />
    </>
  );
}
