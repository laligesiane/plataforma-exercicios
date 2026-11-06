"use client";

import { useState } from "react";

/** Pista do professor: fica fechada até o aluno pedir. */
export function Dica({ texto }: { texto?: string }) {
  const [aberta, setAberta] = useState(false);
  if (!texto?.trim()) return null;
  return aberta ? (
    <p className="mt-2 rounded-xl bg-primaria-suave px-3.5 py-2 text-sm">
      <strong className="font-bold text-primaria">Dica:</strong> {texto}
    </p>
  ) : (
    <button type="button" onClick={() => setAberta(true)} className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-primaria underline-offset-4 hover:underline">
      <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2V17h6v-.3c0-.8.4-1.5 1-2A7 7 0 0 0 12 2Z" />
      </svg>
      Ver dica
    </button>
  );
}
