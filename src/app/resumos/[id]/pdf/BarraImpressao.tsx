"use client";

import { useEffect } from "react";
import { botaoPrimario, botaoSecundario } from "@/components/ui/estilos";

/** Barra que some no PDF. Abre a janela de impressão sozinha quando a página termina de carregar. */
export function BarraImpressao() {
  useEffect(() => {
    let cancelado = false;
    document.fonts.ready.then(() => {
      if (!cancelado) setTimeout(() => window.print(), 300);
    });
    return () => {
      cancelado = true;
    };
  }, []);

  return (
    <div className="sticky top-0 z-10 border-b border-linha bg-suave print:hidden">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <p className="text-sm text-tinta-suave">
          Na janela de impressão, escolha <strong className="text-tinta">Salvar como PDF</strong>.
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={() => {
              // Aberta em outra aba: fecha. Se o navegador não deixar, volta.
              window.close();
              setTimeout(() => history.back(), 150);
            }} className={botaoSecundario}>
            Voltar
          </button>
          <button type="button" onClick={() => window.print()} className={`${botaoPrimario} py-1.5 text-sm`}>
            Salvar como PDF
          </button>
        </div>
      </div>
    </div>
  );
}
