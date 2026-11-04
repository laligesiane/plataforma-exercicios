"use client";

import { useEffect, useState } from "react";
import type { Secao } from "@/lib/documento";

/** Sumário do resumo. Na tela larga fica fixo ao lado do texto e marca a seção que está sendo lida. */
export function Sumario({ secoes }: { secoes: Secao[] }) {
  const [atual, setAtual] = useState(secoes[0]?.id);

  useEffect(() => {
    const alvos = secoes.flatMap((s) => document.getElementById(s.id) ?? []);
    if (!alvos.length) return;
    const aoRolar = () => {
      // A seção atual é o último título que já passou do topo da tela (com uma folga).
      let ultimo = alvos[0].id;
      for (const el of alvos) if (el.getBoundingClientRect().top <= 120) ultimo = el.id;
      setAtual(ultimo);
    };
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, [secoes]);

  return (
    <nav aria-label="Sumário" className="rounded-2xl bg-suave p-5 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
      <h2 className="text-sm font-bold tracking-wide text-tinta-suave uppercase">Neste resumo</h2>
      <ol className="mt-2 space-y-1">
        {secoes.map((s) => (
          <li key={s.id} className={s.nivel === 3 ? "pl-4 text-sm" : "font-bold"}>
            <a
              href={`#${s.id}`}
              aria-current={atual === s.id ? "location" : undefined}
              className="-mx-2 block rounded-lg px-2 py-0.5 hover:text-primaria aria-[current]:bg-primaria-suave aria-[current]:text-primaria"
            >
              {s.texto}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
