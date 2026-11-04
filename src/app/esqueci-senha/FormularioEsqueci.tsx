"use client";

import { useActionState } from "react";
import { Mensagem } from "@/components/ui/Mensagem";
import { botaoPrimario, campo, rotulo } from "@/components/ui/estilos";
import { pedirNovaSenha } from "./actions";

export function FormularioEsqueci() {
  const [estado, acao, enviando] = useActionState(pedirNovaSenha, null);

  return (
    <form action={acao} className="space-y-4">
      <div>
        <label htmlFor="email" className={rotulo}>
          E-mail
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required className={campo} />
      </div>
      <Mensagem estado={estado} />
      <button type="submit" disabled={enviando} className={`${botaoPrimario} w-full`}>
        {enviando ? "Enviando..." : "Enviar link"}
      </button>
    </form>
  );
}
