"use client";

import { useActionState } from "react";
import { Mensagem } from "@/components/ui/Mensagem";
import { botaoPrimario, campo, rotulo } from "@/components/ui/estilos";
import { verificarSegundaEtapa } from "./actions";

export function FormularioVerificar({ proximo }: { proximo?: string }) {
  const [estado, acao, enviando] = useActionState(verificarSegundaEtapa, null);

  return (
    <form action={acao} className="space-y-4">
      {proximo && <input type="hidden" name="proximo" value={proximo} />}
      <div>
        <label htmlFor="codigo" className={rotulo}>
          Código do app
        </label>
        <input
          id="codigo"
          name="codigo"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9 ]*"
          maxLength={7}
          required
          autoFocus
          placeholder="123456"
          className={`${campo} text-center text-2xl font-bold tracking-[0.4em]`}
        />
      </div>
      <Mensagem estado={estado} />
      <button type="submit" disabled={enviando} className={`${botaoPrimario} w-full`}>
        {enviando ? "Conferindo..." : "Confirmar"}
      </button>
    </form>
  );
}
