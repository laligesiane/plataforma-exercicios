"use client";

import { useEffect, useState } from "react";
import { botaoSecundario } from "@/components/ui/estilos";
import { EVENTO_ESCOLHIDA } from "@/lib/analytics/eventos";
import { abrirEscolhaCookies, lerEscolha } from "@/lib/analytics/cliente";

/** Mostra a escolha atual sobre cookies de estatística e deixa mudar. */
export function EscolhaCookies() {
  const [escolha, setEscolha] = useState<string | null>(null);

  useEffect(() => {
    const ler = () => setEscolha(lerEscolha());
    ler();
    window.addEventListener(EVENTO_ESCOLHIDA, ler);
    return () => window.removeEventListener(EVENTO_ESCOLHIDA, ler);
  }, []);

  const texto =
    escolha === "aceito"
      ? "Você aceitou os cookies de estatística (Google Analytics)."
      : escolha === "recusado"
        ? "Você recusou os cookies de estatística. Nada é enviado ao Google Analytics."
        : "Você ainda não escolheu.";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-tinta-suave">{texto}</p>
      <button type="button" onClick={abrirEscolhaCookies} className={botaoSecundario}>
        Mudar escolha
      </button>
    </div>
  );
}
