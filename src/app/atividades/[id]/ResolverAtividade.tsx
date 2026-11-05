"use client";

import { useState } from "react";
import { AulaAtividade, type RespostaDada } from "@/components/exercicios/AulaAtividade";
import type { Exercicio } from "@/lib/atividades/modelo";
import type { EnviarProducao, ProducaoSalva } from "@/components/exercicios/Producao";
import { enviarAudioDoAluno } from "@/lib/atividades/enviarMidia";
import type { ResumoAtividade } from "@/lib/atividades/resumo";
import type { DuvidaSalva } from "@/components/exercicios/NaoEntendi";
import { enviarDuvida, enviarProducao, registrarEnvio, registrarResposta } from "../actions";

type Props = {
  atividadeId: string;
  exercicios: Exercicio[];
  respostasAnteriores: Record<string, string>;
  primeirasAnteriores: Record<string, boolean>;
  salvar: boolean;
  producoes: Record<string, ProducaoSalva>;
  duvidas?: Record<string, DuvidaSalva[]>;
};

export function ResolverAtividade({ atividadeId, exercicios, respostasAnteriores, primeirasAnteriores, salvar, producoes, duvidas }: Props) {
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

  const aoProduzir: EnviarProducao = async (exercicioId, itemId, dados) => {
    if ("texto" in dados) return enviarProducao({ atividadeId, exercicioId, itemId, texto: dados.texto });
    const envio = await enviarAudioDoAluno(dados.audio, atividadeId);
    if ("erro" in envio) return { ok: false, erro: envio.erro };
    return enviarProducao({ atividadeId, exercicioId, itemId, audio: envio.caminho });
  };

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
        producoes={producoes}
        onProducao={salvar ? aoProduzir : undefined}
        duvidas={duvidas}
        onDuvida={salvar ? (exercicioId, texto) => enviarDuvida(atividadeId, exercicioId, texto) : undefined}
      />
    </>
  );
}
