"use client";

import { useActionState } from "react";
import { Mensagem } from "@/components/ui/Mensagem";
import { botaoPrimario, campo, rotulo } from "@/components/ui/estilos";
import { cadastrarProfessor } from "./actions";

export function FormularioCadastro() {
  const [estado, acao, enviando] = useActionState(cadastrarProfessor, null);

  if (estado?.sucesso) return <Mensagem estado={estado} />;

  return (
    <form action={acao} className="space-y-4">
      <div>
        <label htmlFor="nome" className={rotulo}>
          Seu nome
        </label>
        <input id="nome" name="nome" autoComplete="name" required className={campo} />
      </div>
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
        <input id="senha" name="senha" type="password" autoComplete="new-password" minLength={8} required className={campo} />
      </div>
      <Mensagem estado={estado} />
      <button type="submit" disabled={enviando} className={`${botaoPrimario} w-full`}>
        {enviando ? "Criando..." : "Criar conta grátis"}
      </button>
    </form>
  );
}
