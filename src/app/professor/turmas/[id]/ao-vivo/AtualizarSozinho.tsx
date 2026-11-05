"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/** Recarrega os dados da página a cada poucos segundos, enquanto a aba estiver aberta e visível. */
export function AtualizarSozinho({ segundos = 5 }: { segundos?: number }) {
  const router = useRouter();
  const [pausado, setPausado] = useState(false);
  const [hora, setHora] = useState("");

  useEffect(() => {
    if (pausado) return;
    const marcar = () => setHora(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    marcar();
    const id = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      router.refresh();
      marcar();
    }, segundos * 1000);
    return () => clearInterval(id);
  }, [pausado, router, segundos]);

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="flex items-center gap-2 text-tinta-suave" aria-live="off">
        <span aria-hidden className={`size-2.5 rounded-full ${pausado ? "bg-linha" : "animate-pulse bg-primaria"}`} />
        {pausado ? "Pausado" : `Ao vivo${hora ? ` · ${hora}` : ""}`}
      </span>
      <button type="button" onClick={() => setPausado((p) => !p)} className="font-bold text-primaria hover:underline">
        {pausado ? "Continuar" : "Pausar"}
      </button>
    </div>
  );
}
