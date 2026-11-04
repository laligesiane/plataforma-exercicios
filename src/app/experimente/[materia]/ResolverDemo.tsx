"use client";

import { AulaAtividade } from "@/components/exercicios/AulaAtividade";
import type { EnviarProducao } from "@/components/exercicios/Producao";
import type { Exercicio } from "@/lib/atividades/modelo";

/** Na demonstração a produção não vai a lugar nenhum: fica só na tela, para o visitante ver o fluxo. */
const producaoLocal: EnviarProducao = async (_exercicioId, _itemId, dados) => ({
  ok: true,
  salva: {
    texto: "texto" in dados ? dados.texto : "",
    audioUrl: "audio" in dados ? URL.createObjectURL(dados.audio) : null,
    enviadaEm: new Date().toISOString(),
    correcao: null,
  },
});

export function ResolverDemo({ exercicios }: { exercicios: Exercicio[] }) {
  return <AulaAtividade exercicios={exercicios} onProducao={producaoLocal} />;
}
