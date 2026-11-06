"use client";

import { fmt } from "@/i18n/config";
import { useDicionario } from "@/i18n/cliente";
import { useState } from "react";
import { botaoPrimario, botaoTexto } from "@/components/ui/estilos";
import type { Pergunta } from "@/lib/documento/jogos";
import { tocarResultado } from "@/lib/som";
import { Icone } from "./Icones";
import { FimDeJogo, Progresso, incentivo, type AcoesFim } from "./comum";

/**
 * Quiz e Complete a frase: uma pergunta por vez, com opções para tocar.
 * Errou: a opção fica marcada e dá para tentar de novo ou ver a resposta.
 */
export function JogoPerguntas({
  perguntas,
  instrucao,
  acoes,
}: {
  perguntas: Pergunta[];
  instrucao: string;
  acoes: AcoesFim;
}) {
  const [indice, setIndice] = useState(0);
  const [erradas, setErradas] = useState<string[]>([]);
  const [resolvida, setResolvida] = useState<"acertou" | "viu" | null>(null);
  const [acertosDePrimeira, setAcertosDePrimeira] = useState(0);
  const [sequencia, setSequencia] = useState(0);
  const atual = perguntas[indice];
  const t = useDicionario().jogos;

  if (!atual) {
    return (
      <FimDeJogo
        titulo={incentivo(acertosDePrimeira, perguntas.length, t)}
        texto={fmt(t.acertouPrimeira, { n: acertosDePrimeira, total: perguntas.length })}
        acoes={acoes}
      />
    );
  }

  function escolher(opcao: string) {
    if (resolvida || erradas.includes(opcao)) return;
    if (opcao === atual.certa) {
      tocarResultado(true);
      setResolvida("acertou");
      if (erradas.length === 0) {
        setAcertosDePrimeira((n) => n + 1);
        setSequencia((n) => n + 1);
      }
    } else {
      tocarResultado(false);
      setErradas((e) => [...e, opcao]);
      setSequencia(0);
    }
  }

  function proxima() {
    setIndice((i) => i + 1);
    setErradas([]);
    setResolvida(null);
  }

  return (
    <div>
      <Progresso
        feitos={indice}
        total={perguntas.length}
        extra={sequencia >= 2 ? <span className="inline-flex items-center gap-1 font-bold text-primaria"><Icone nome="fogo" className="size-4" /> {fmt(t.seguidas, { n: sequencia })}</span> : undefined}
      />
      <p className="mt-5 text-xs font-bold tracking-wide text-tinta-suave uppercase">{instrucao}</p>
      <p className="mt-2 rounded-2xl border-2 border-linha bg-fundo p-5 text-lg leading-relaxed whitespace-pre-line">{atual.enunciado}</p>

      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {atual.opcoes.map((op) => {
          const errou = erradas.includes(op);
          const certa = resolvida && op === atual.certa;
          return (
            <li key={op}>
              <button
                type="button"
                onClick={() => escolher(op)}
                disabled={!!resolvida || errou}
                className={`w-full rounded-2xl border-2 px-4 py-3 text-left font-bold transition-colors ${
                  certa
                    ? "border-certo bg-certo-fundo text-certo"
                    : errou
                      ? "border-erro bg-erro-fundo text-erro line-through"
                      : "border-linha bg-fundo hover:border-primaria disabled:opacity-60"
                }`}
              >
                {op}
              </button>
            </li>
          );
        })}
      </ul>

      <div aria-live="polite" className="mt-4 min-h-12">
        {resolvida ? (
          <div className="rounded-2xl bg-suave p-4">
            <p className={`font-bold ${resolvida === "acertou" ? "text-certo" : "text-tinta"}`}>
              {resolvida === "acertou" ? (erradas.length ? t.agoraFoi : t.acertou) : fmt(t.respostaE, { resposta: atual.certa })}
            </p>
            <p className="mt-1 text-sm whitespace-pre-line text-tinta-suave">{atual.explicacao}</p>
            <button type="button" onClick={proxima} className={`${botaoPrimario} mt-3`} autoFocus>
              {indice + 1 < perguntas.length ? t.proxima : t.verResultado}
            </button>
          </div>
        ) : erradas.length > 0 ? (
          <p className="text-sm text-tinta-suave">
            {t.naoEssa}{" "}
            <button type="button" onClick={() => setResolvida("viu")} className={botaoTexto}>
              {t.verResposta}
            </button>
            .
          </p>
        ) : null}
      </div>
    </div>
  );
}
