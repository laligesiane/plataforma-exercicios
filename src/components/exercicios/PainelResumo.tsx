"use client";

import { fmt } from "@/i18n/config";
import { useDicionario } from "@/i18n/cliente";
import type { ResumoAtividade } from "@/lib/atividades/resumo";
import { botaoSecundario } from "@/components/ui/estilos";

/** Resumo depois de "Enviar respostas". Mostra acertos, não nota. */
export function PainelResumo({ resumo, onFechar }: { resumo: ResumoAtividade; onFechar: () => void }) {
  const tx = useDicionario().exercicio;
  const tudoCerto = resumo.certos === resumo.total;
  const titulo = tudoCerto
    ? tx.tudoCerto
    : resumo.certos >= resumo.total * 0.7
      ? tx.muitoBem
      : tx.bomTreino;

  return (
    <section aria-labelledby="titulo-resumo" className="rounded-2xl border-2 border-primaria p-5 sm:p-6">
      <h2 id="titulo-resumo" className="text-2xl font-extrabold tracking-tight">
        {titulo}
      </h2>
      <p className="mt-1 text-tinta-suave">{tx.respostasEnviadas}</p>

      <dl className="mt-5 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-primaria-suave p-3">
          <dt className="text-xs font-bold text-primaria">{tx.certos}</dt>
          <dd className="mt-1 text-2xl font-extrabold text-primaria tabular-nums">
            {resumo.certos}
            <span className="text-base font-bold"> {fmt(tx.de, { total: resumo.total })}</span>
          </dd>
        </div>
        <div className="rounded-xl bg-suave p-3">
          <dt className="text-xs font-bold text-tinta-suave">{tx.dePrimeira}</dt>
          <dd className="mt-1 text-2xl font-extrabold tabular-nums">{resumo.dePrimeira}</dd>
        </div>
        <div className="rounded-xl bg-suave p-3">
          <dt className="text-xs font-bold text-tinta-suave">{tx.semResposta}</dt>
          <dd className="mt-1 text-2xl font-extrabold tabular-nums">{resumo.semResposta}</dd>
        </div>
      </dl>

      <ul className="mt-5 divide-y divide-linha text-sm">
        {resumo.porExercicio.map((e) => (
          <li key={e.id} className="flex items-center justify-between gap-3 py-2">
            <span>
              <span className="font-bold text-tinta-suave">{e.numero}.</span> {e.titulo}
            </span>
            <span className={`font-bold tabular-nums ${e.certos === e.total ? "text-certo" : ""}`}>
              {e.certos}/{e.total}
            </span>
          </li>
        ))}
      </ul>

      {resumo.errados.length > 0 && (
        <div className="mt-4 rounded-xl bg-erro-fundo p-4 text-sm">
          <p className="font-bold text-erro">{tx.paraRevisar}</p>
          <ul className="mt-1.5 space-y-1">
            {resumo.errados.map((e) => (
              <li key={e.itemId}>
                <span className="font-bold">{fmt(tx.exercicioN, { n: e.exercicio })}</span> {e.texto}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button type="button" onClick={onFechar} className={`${botaoSecundario} mt-5`}>
        {tudoCerto ? tx.verAtividade : tx.continuar}
      </button>
    </section>
  );
}
