"use client";

import { fmt } from "@/i18n/config";
import { useDicionario } from "@/i18n/cliente";
import { botaoPrimario } from "@/components/ui/estilos";

/**
 * Barra presa no rodapé do celular enquanto o aluno resolve a atividade:
 * "Próximo" leva ao próximo exercício sem resposta e "Enviar" fica sempre à mão.
 */
export function BarraAtividade({ acertos, total, proximo, onProximo, onEnviar }: {
  acertos: number;
  total: number;
  proximo: boolean;
  onProximo: () => void;
  onEnviar: () => void;
}) {
  const tx = useDicionario().exercicio;
  return (
    <div className="barra-atividade fixed inset-x-0 bottom-0 z-40 border-t border-linha bg-fundo/95 px-4 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] backdrop-blur sm:hidden print:hidden">
      <div className="flex items-center gap-2">
        <span className="mr-auto text-sm font-bold text-tinta-suave tabular-nums">
          {fmt(tx.certosCurto, { certos: acertos, total })}
        </span>
        {proximo && (
          <button type="button" onClick={onProximo} className="min-h-11 rounded-full border-2 border-linha px-4 font-bold">
            {tx.proximo} ↓
          </button>
        )}
        <button type="button" onClick={onEnviar} className={`${botaoPrimario} min-h-11`}>
          {tx.enviar}
        </button>
      </div>
    </div>
  );
}
