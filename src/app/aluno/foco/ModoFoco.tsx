"use client";

import { fmt } from "@/i18n/config";
import { useDicionario } from "@/i18n/cliente";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useFoco } from "@/components/foco/FocoProvider";
import { PlantaFoco } from "@/components/PlantaFoco";
import { botaoPrimario, botaoSecundario } from "@/components/ui/estilos";
import { DURACAO_PADRAO, DURACOES_MIN, ULTIMA_FASE, faseDoProgresso, formatarTempo, progressoDa, restanteDa } from "@/lib/foco";

/**
 * Página do modo foco: escolhe o tempo e acompanha o Brotinho crescendo.
 * A sessão continua quando o aluno sai daqui para estudar em outras páginas da Repasa;
 * lá ele vê o mini-Brotinho no canto da tela.
 */
export function ModoFoco() {
  const { sessao, agora, jardim, concluida, iniciar, pausar, retomar, desistir, dispensarConclusao, verArvore } = useFoco();
  const [duracao, setDuracao] = useState<number>(DURACAO_PADRAO);
  const t = useDicionario().foco;

  // Quem vê a comemoração aqui não precisa vê-la de novo no mini-Brotinho.
  useEffect(() => {
    if (concluida !== null) return () => dispensarConclusao();
  }, [concluida, dispensarConclusao]);

  const pausado = sessao?.fimEm === null;
  const restante = sessao ? restanteDa(sessao, agora) : duracao * 60_000;
  const fase = sessao ? faseDoProgresso(progressoDa(sessao, agora)) : concluida !== null ? ULTIMA_FASE : 0;

  let frase: string;
  if (concluida !== null && !sessao) frase = fmt(t.sessaoConcluida, { n: concluida });
  else if (!sessao) frase = t.plante;
  else if (pausado) frase = t.pausadoFrase;
  else frase = t.fases[fase].frase;

  return (
    <div className="mt-8 flex flex-col items-center text-center">
      <div className="w-full rounded-3xl bg-primaria-suave px-4 pt-6 pb-5">
        <div key={fase} className="foco-nova-fase mx-auto w-fit">
          <PlantaFoco fase={fase} pausado={!sessao ? concluida === null : pausado} tamanho={220} textos={t} />
        </div>
        <p className="mt-2 text-sm font-bold text-primaria">{t.fases[fase].nome}</p>
      </div>

      <p className="mt-6 text-6xl font-extrabold tabular-nums tracking-tight">{formatarTempo(concluida !== null && !sessao ? 0 : restante)}</p>
      <p role="status" aria-live="polite" className="mt-2 min-h-6 font-semibold text-tinta-suave">
        {frase}
      </p>

      {!sessao && (
        <fieldset className="mt-6">
          <legend className="mb-2 text-sm font-bold">{t.quantoTempo}</legend>
          <div className="flex flex-wrap justify-center gap-2">
            {DURACOES_MIN.map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={duracao === m}
                onClick={() => {
                  setDuracao(m);
                  dispensarConclusao();
                }}
                className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
                  duracao === m ? "bg-tinta text-fundo" : "border border-linha text-tinta-suave hover:border-tinta hover:text-tinta"
                }`}
              >
                {fmt(t.min, { n: m })}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {!sessao && concluida !== null && (
          <button type="button" className={`${botaoPrimario} foco-revela`} onClick={verArvore}>
            {t.verArvore}
          </button>
        )}
        {!sessao && (
          <button type="button" className={concluida !== null ? botaoSecundario : botaoPrimario} onClick={() => iniciar(duracao)}>
            {concluida !== null ? t.plantarOutra : t.comecar}
          </button>
        )}
        {sessao && (
          <button type="button" className={pausado ? botaoPrimario : botaoSecundario} onClick={pausado ? retomar : pausar}>
            {pausado ? t.continuar : t.pausar}
          </button>
        )}
        {sessao && (
          <button type="button" className={botaoSecundario} onClick={desistir}>
            {t.desistir}
          </button>
        )}
      </div>

      <div className="mt-8 w-full rounded-2xl bg-suave p-4 text-left text-sm text-tinta-suave">
        <p>
          <strong className="text-tinta">{t.navegue}</strong> {t.navegueTexto}
        </p>
        <p className="mt-2">
          {t.silenciar1} <strong className="text-tinta">{t.naoPerturbe}</strong> {t.silenciar2}
        </p>
      </div>

      <Link
        href="/aluno/foco/colecao"
        className="mt-6 flex w-full items-center justify-between rounded-2xl border border-linha p-4 text-left hover:border-tinta"
      >
        <span>
          <span className="block font-extrabold">{t.colecao}</span>
          <span className="block text-sm text-tinta-suave">{t.colecaoTexto}</span>
        </span>
        <span aria-hidden className="text-xl text-tinta-suave">›</span>
      </Link>

      {jardim && jardim.arvores > 0 && (
        <section className="mt-6 w-full rounded-2xl border border-linha p-4 text-left">
          <h2 className="font-extrabold">{t.jardimHoje}</h2>
          <p className="text-sm text-tinta-suave">
            {jardim.arvores === 1 ? t.arvore1 : fmt(t.arvoresN, { n: jardim.arvores })} · {fmt(t.minutosEstudo, { n: jardim.minutos })}
          </p>
          <ul className="mt-3 flex flex-wrap gap-1" aria-hidden>
            {Array.from({ length: Math.min(jardim.arvores, 24) }, (_, i) => (
              <li key={i}>
                <PlantaFoco fase={ULTIMA_FASE} tamanho={44} animado={false} textos={t} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
