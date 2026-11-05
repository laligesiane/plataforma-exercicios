"use client";

import { useMemo, useState } from "react";
import { BotaoSom } from "@/components/exercicios/BotaoSom";
import { registrarEvento } from "@/lib/analytics/cliente";
import { rodadaDeCartoes, totalDeRodadas, type Cartao } from "@/lib/documento/cartoes";
import { cartoesDoJogo, montarComplete, montarLigar, montarQuiz, montarVerdadeiroFalso, type ModoJogo } from "@/lib/documento/jogos";
import { EstudarCartoes } from "./EstudarCartoes";
import { JogoLigar } from "./JogoLigar";
import { JogoMemoria } from "./JogoMemoria";
import { JogoPerguntas } from "./JogoPerguntas";
import { JogoVerdadeiroFalso } from "./JogoVerdadeiroFalso";
import type { AcoesFim } from "./comum";

/**
 * Escolhe os 10 cartões da rodada e monta o jogo pedido.
 * "Jogar de novo" embaralha outra vez; "Outros 10 cartões" passa para a próxima rodada.
 */
export function Jogo({ modo, cartoes, resumoId }: { modo: ModoJogo; cartoes: Cartao[]; resumoId: string }) {
  const [rodada, setRodada] = useState(0);
  const [vez, setVez] = useState(0);
  // Cada jogo usa só os cartões que fazem sentido para ele (ex.: lacunas só no "Complete a frase").
  const usaveis = useMemo(() => cartoesDoJogo(modo, cartoes), [modo, cartoes]);
  const daRodada = useMemo(() => rodadaDeCartoes(usaveis, rodada), [usaveis, rodada]);
  const semente = `${resumoId}:${modo}:${rodada}:${vez}`;
  const rodadas = totalDeRodadas(usaveis);

  const acoes: AcoesFim = {
    deNovo: () => setVez((v) => v + 1),
    outrosCartoes:
      rodadas > 1
        ? () => {
            setRodada((r) => r + 1);
            setVez(0);
          }
        : undefined,
    hrefJogos: `/aluno/resumos/${resumoId}/jogar`,
    aoTerminar: () => registrarEvento("jogo_concluido", { modo, cartoes: daRodada.length }),
  };

  const jogo = (() => {
    switch (modo) {
      case "cartoes":
        return <EstudarCartoes cartoes={daRodada} acoes={acoes} />;
      case "memoria":
        return <JogoMemoria cartoes={daRodada} semente={semente} acoes={acoes} />;
      case "quiz":
        return <JogoPerguntas perguntas={montarQuiz(daRodada, semente)} instrucao="Qual termo combina com a pista?" acoes={acoes} />;
      case "complete":
        return <JogoPerguntas perguntas={montarComplete(daRodada, semente)} instrucao="Qual palavra completa a frase?" acoes={acoes} />;
      case "verdadeiro-falso":
        return <JogoVerdadeiroFalso afirmacoes={montarVerdadeiroFalso(daRodada, semente)} acoes={acoes} />;
      case "ligar":
        return <JogoLigar telas={montarLigar(daRodada, semente)} acoes={acoes} />;
    }
  })();

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3 text-xs text-tinta-suave">
        <span>
          {rodadas > 1 ? `Rodada ${(rodada % rodadas) + 1} de ${rodadas} · ` : ""}
          {daRodada.length} {daRodada.length === 1 ? "cartão" : "cartões"}
        </span>
        <BotaoSom />
      </div>
      {/* A chave recomeça o jogo do zero a cada rodada nova ou "jogar de novo". */}
      <div key={semente}>{jogo}</div>
    </div>
  );
}
