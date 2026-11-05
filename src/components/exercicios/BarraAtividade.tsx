"use client";

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
  return (
    <div className="barra-atividade fixed inset-x-0 bottom-0 z-40 border-t border-linha bg-fundo/95 px-4 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] backdrop-blur sm:hidden print:hidden">
      <div className="flex items-center gap-2">
        <span className="mr-auto text-sm font-bold text-tinta-suave tabular-nums">
          {acertos}/{total} certos
        </span>
        {proximo && (
          <button type="button" onClick={onProximo} className="min-h-11 rounded-full border-2 border-linha px-4 font-bold">
            Próximo ↓
          </button>
        )}
        <button type="button" onClick={onEnviar} className={`${botaoPrimario} min-h-11`}>
          Enviar
        </button>
      </div>
    </div>
  );
}
