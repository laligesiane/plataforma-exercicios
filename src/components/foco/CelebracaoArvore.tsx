"use client";

import { especieTx, seloTx, type TextosFoco } from "@/i18n/dicionarios/focoPt";
import { fmt } from "@/i18n/config";
import { useDicionario } from "@/i18n/cliente";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { PlantaFoco } from "@/components/PlantaFoco";
import { botaoPrimario, botaoSecundario } from "@/components/ui/estilos";
import { ULTIMA_FASE } from "@/lib/foco";
import { SELOS, especiePorId } from "@/lib/foco/colecao";
import { MedalhaSelo } from "./MedalhaSelo";
import { useFoco } from "./FocoProvider";

const CORES_CONFETE = ["#34c38f", "#ffd166", "#ff9fb0", "#5aa9e6", "#9b6bd6", "#ff9f1c"];
const CONFETES = Array.from({ length: 22 }, (_, i) => ({
  esquerda: (i * 37) % 100,
  atraso: ((i * 13) % 10) / 10,
  duracao: 1.8 + ((i * 7) % 10) / 10,
  cor: CORES_CONFETE[i % CORES_CONFETE.length],
  redondo: i % 3 === 0,
}));

/** "1 minuto", "25 minutos", "1 hora", "1 hora e 30 minutos". */
function tempoEstudado(min: number, t: TextosFoco) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const minutos = m === 1 ? t.minuto1 : fmt(t.minutosN, { n: m });
  if (h === 0) return minutos;
  const horas = h === 1 ? t.hora1 : fmt(t.horasN, { n: h });
  return m === 0 ? horas : fmt(t.horasEMinutos, { horas, minutos });
}

/**
 * A comemoração do fim da sessão: a árvore aparece com confete, diz quanto tempo o aluno estudou,
 * qual espécie entrou na coleção e os selos novos.
 */
export function CelebracaoArvore() {
  const { celebrando, colheita, concluida, fecharCelebracao } = useFoco();
  const fechar = useRef<HTMLButtonElement>(null);
  const t = useDicionario().foco;

  useEffect(() => {
    if (!celebrando) return;
    fechar.current?.focus();
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === "Escape") fecharCelebracao();
    }
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [celebrando, fecharCelebracao]);

  if (!celebrando) return null;
  const minutos = colheita?.minutos ?? concluida ?? 0;
  const esp = colheita ? especiePorId(colheita.especie) : null;
  const selos = SELOS.filter((s) => colheita?.selos.includes(s.id));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" onClick={fecharCelebracao}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="celebracao-titulo"
        onClick={(e) => e.stopPropagation()}
        className="foco-surge relative max-h-[calc(100dvh-2rem)] w-full max-w-sm overflow-x-hidden overflow-y-auto rounded-3xl bg-fundo px-5 pt-5 pb-6 text-center shadow-2xl"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 overflow-hidden" aria-hidden>
          {CONFETES.map((c, i) => (
            <span
              key={i}
              className="foco-confete absolute top-0 block"
              style={{
                left: `${c.esquerda}%`,
                width: c.redondo ? 8 : 6,
                height: c.redondo ? 8 : 12,
                borderRadius: c.redondo ? 999 : 2,
                background: c.cor,
                animationDelay: `${c.atraso}s`,
                animationDuration: `${c.duracao}s`,
              }}
            />
          ))}
        </div>

        <button
          ref={fechar}
          type="button"
          onClick={fecharCelebracao}
          aria-label={t.fechar}
          className="absolute top-3 right-3 z-10 flex size-8 items-center justify-center rounded-full text-xl text-tinta-suave hover:bg-suave hover:text-tinta"
        >
          ×
        </button>

        <div className="relative mx-auto w-fit">
          <div className="foco-raios absolute inset-0 -z-0 m-auto size-52 rounded-full" aria-hidden />
          <div className={esp ? "foco-revela relative" : "relative"}>
            {esp ? (
              <PlantaFoco fase={ULTIMA_FASE} especie={esp.id} tamanho={180} textos={t} />
            ) : (
              <PlantaFoco fase={ULTIMA_FASE - 1} tamanho={180} textos={t} />
            )}
          </div>
        </div>

        <h2 id="celebracao-titulo" className="mt-1 text-2xl font-extrabold">
          {t.parabens}
        </h2>
        <p className="mt-1 font-semibold text-tinta-suave">
          {t.estudou1} <strong className="text-tinta">{tempoEstudado(minutos, t)}</strong> {t.estudou2}
        </p>

        <div role="status" aria-live="polite" className="mt-4 rounded-2xl bg-primaria-suave px-4 py-3">
          {!esp && <p className="font-bold text-primaria">{t.regando}</p>}
          {esp && (
            <>
              {colheita?.especieNova && (
                <span className="mb-1 inline-block rounded-full bg-primaria px-2.5 py-0.5 text-xs font-extrabold text-white">
                  {t.especieNova}
                </span>
              )}
              <p className="text-sm font-bold text-primaria">{colheita?.salva ? t.novaNaColecao : t.ganhou}</p>
              <p className="text-lg font-extrabold">{especieTx(t, esp.id).nome}</p>
              <p className="mt-0.5 text-sm text-tinta-suave">{especieTx(t, esp.id).frase}</p>
              {colheita && !colheita.salva && (
                <p className="mt-1 text-xs text-tinta-suave">{t.naoGuardou}</p>
              )}
            </>
          )}
        </div>

        {selos.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-extrabold">{selos.length === 1 ? t.novoSelo : t.novosSelos}</p>
            <ul className="mt-2 flex flex-wrap justify-center gap-3">
              {selos.map((s) => (
                <li key={s.id} className="foco-revela flex w-24 flex-col items-center">
                  <MedalhaSelo selo={s} tamanho={52} />
                  <span className="mt-1 text-xs font-bold">{seloTx(t, s.id).nome}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {colheita?.proxima && <p className="mt-4 text-sm text-tinta-suave">{colheita.proxima}</p>}

        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {colheita?.salva ? (
            <Link href="/aluno/foco/colecao" onClick={fecharCelebracao} className={botaoPrimario}>
              {t.verColecao}
            </Link>
          ) : (
            <button type="button" onClick={fecharCelebracao} className={botaoPrimario}>
              {t.oba}
            </button>
          )}
          {colheita?.salva && (
            <button type="button" onClick={fecharCelebracao} className={botaoSecundario}>
              {t.fechar}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
