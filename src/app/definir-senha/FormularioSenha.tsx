"use client";

import { useActionState } from "react";
import { Mensagem } from "@/components/ui/Mensagem";
import { botaoPrimario, campo, rotulo } from "@/components/ui/estilos";
import { definirSenha } from "./actions";

export function FormularioSenha() {
  const [estado, acao, enviando] = useActionState(definirSenha, null);

  return (
    <form action={acao} className="space-y-4">
      <div>
        <label htmlFor="senha" className={rotulo}>
          Nova senha
        </label>
        <input id="senha" name="senha" type="password" autoComplete="new-password" minLength={8} required className={campo} />
      </div>
      <div>
        <label htmlFor="confirmacao" className={rotulo}>
          Repita a senha
        </label>
        <input
          id="confirmacao"
          name="confirmacao"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className={campo}
        />
      </div>
      <Mensagem estado={estado} />
      <button type="submit" disabled={enviando} className={`${botaoPrimario} w-full`}>
        {enviando ? "Salvando..." : "Salvar e entrar"}
      </button>
    </form>
  );
}
