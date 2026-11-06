"use client";

import { useActionState } from "react";
import { Mensagem } from "@/components/ui/Mensagem";
import { botaoPrimario, campo, rotulo } from "@/components/ui/estilos";
import { useDicionario } from "@/i18n/cliente";
import { pedirNovaSenha } from "./actions";

export function FormularioEsqueci() {
  const [estado, acao, enviando] = useActionState(pedirNovaSenha, null);
  const d = useDicionario();

  return (
    <form action={acao} className="space-y-4">
      <div>
        <label htmlFor="email" className={rotulo}>
          {d.auth.email}
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required className={campo} />
      </div>
      <Mensagem estado={estado} />
      <button type="submit" disabled={enviando} className={`${botaoPrimario} w-full`}>
        {enviando ? d.esqueci.enviando : d.esqueci.botao}
      </button>
    </form>
  );
}
