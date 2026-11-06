"use client";

import { fmt } from "@/i18n/config";
import { useDicionario } from "@/i18n/cliente";
import { useState } from "react";
import { botaoPrimario } from "@/components/ui/estilos";
import type { Afirmacao } from "@/lib/documento/jogos";
import { tocarResultado } from "@/lib/som";
import { Icone } from "./Icones";
import { FimDeJogo, Progresso, incentivo, type AcoesFim } from "./comum";

/** Verdadeiro ou falso: a explicação mostrada é a do termo, ou foi trocada pela de outro? */
export function JogoVerdadeiroFalso({ afirmacoes, acoes }: { afirmacoes: Afirmacao[]; acoes: AcoesFim }) {
  const [indice, setIndice] = useState(0);
  const [resposta, setResposta] = useState<boolean | null>(null);
  const [acertos, setAcertos] = useState(0);
  const [sequencia, setSequencia] = useState(0);
  const atual = afirmacoes[indice];
  const t = useDicionario().jogos;

  if (!atual) {
    return (
      <FimDeJogo
        titulo={incentivo(acertos, afirmacoes.length, t)}
        texto={fmt(t.acertouDe, { n: acertos, total: afirmacoes.length })}
        acoes={acoes}
      />
    );
  }

  const acertou = resposta !== null && resposta === atual.verdadeira;

  function responder(valor: boolean) {
    if (resposta !== null) return;
    const certo = valor === atual.verdadeira;
    tocarResultado(certo);
    setResposta(valor);
    setAcertos((n) => n + (certo ? 1 : 0));
    setSequencia((n) => (certo ? n + 1 : 0));
  }

  return (
    <div>
      <Progresso
        feitos={indice}
        total={afirmacoes.length}
        extra={sequencia >= 2 ? <span className="inline-flex items-center gap-1 font-bold text-primaria"><Icone nome="fogo" className="size-4" /> {fmt(t.seguidas, { n: sequencia })}</span> : undefined}
      />
      <p className="mt-5 text-center text-sm font-bold text-tinta-suave">{t.vfPergunta}</p>
      <div className="mt-2 overflow-hidden rounded-3xl border-2 border-linha bg-fundo">
        <div className="border-b-2 border-linha bg-primaria-suave px-5 py-4 text-center">
          <p className="text-xs font-bold tracking-wide text-tinta-suave uppercase">{t.termo}</p>
          <p className="mt-1 text-2xl font-extrabold">{atual.termo}</p>
        </div>
        <div className="px-5 py-4">
          <p className="text-xs font-bold tracking-wide text-tinta-suave uppercase">{t.explicacao}</p>
          <p className="mt-1 text-lg leading-relaxed whitespace-pre-line">{atual.explicacao}</p>
        </div>
      </div>

      {resposta === null ? (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => responder(false)}
            className="rounded-2xl border-2 border-erro bg-erro-fundo py-4 text-lg font-extrabold text-erro transition-transform active:scale-95"
          >
            <span className="inline-flex items-center justify-center gap-2"><Icone nome="errado" /> {t.falso}</span>
          </button>
          <button
            type="button"
            onClick={() => responder(true)}
            className="rounded-2xl border-2 border-certo bg-certo-fundo py-4 text-lg font-extrabold text-certo transition-transform active:scale-95"
          >
            <span className="inline-flex items-center justify-center gap-2"><Icone nome="certo" /> {t.verdadeiro}</span>
          </button>
        </div>
      ) : (
        <div aria-live="polite" className="mt-4 rounded-2xl bg-suave p-4">
          <p className={`font-bold ${acertou ? "text-certo" : "text-erro"}`}>
            {acertou ? t.acertou : t.naoFoi} {atual.verdadeira ? t.eraVerdadeiro : t.eraFalso}
          </p>
          {!atual.verdadeira && (
            <p className="mt-1 text-sm text-tinta-suave">
              {t.explicacaoDe} <strong>{atual.termo}</strong> {t.eh} {atual.explicacaoCerta}
            </p>
          )}
          <button
            type="button"
            onClick={() => {
              setIndice((i) => i + 1);
              setResposta(null);
            }}
            className={`${botaoPrimario} mt-3`}
            autoFocus
          >
            {indice + 1 < afirmacoes.length ? t.proxima : t.verResultado}
          </button>
        </div>
      )}
    </div>
  );
}
