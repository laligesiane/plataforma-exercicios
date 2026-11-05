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
    <button type="button" onClick={() => setAberta(true)} className="mt-2 text-sm font-bold text-primaria underline-offset-4 hover:underline">
      💡 Ver dica
    </button>
  );
}
