"use client";

import { useActionState } from "react";
import { Mensagem } from "@/components/ui/Mensagem";
import { botaoPrimario, campo, rotulo } from "@/components/ui/estilos";
import { entrar } from "./actions";

export function FormularioEntrar({ proximo }: { proximo?: string }) {
  const [estado, acao, enviando] = useActionState(entrar, null);

  return (
    <form action={acao} className="space-y-4">
      {proximo && <input type="hidden" name="proximo" value={proximo} />}
      <div>
        <label htmlFor="email" className={rotulo}>
          E-mail
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required className={campo} />
      </div>
      <div>
        <label htmlFor="senha" className={rotulo}>
          Senha
        </label>
        <input id="senha" name="senha" type="password" autoComplete="current-password" required className={campo} />
      </div>
      <Mensagem estado={estado} />
      <button type="submit" disabled={enviando} className={`${botaoPrimario} w-full`}>
        {enviando ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
