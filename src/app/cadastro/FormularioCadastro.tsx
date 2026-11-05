"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { registrarEvento } from "@/lib/analytics/cliente";
import { Mensagem } from "@/components/ui/Mensagem";
import { botaoPrimario, caixaMarcar, campo, rotulo } from "@/components/ui/estilos";
import { cadastrar } from "./actions";

export function FormularioCadastro({ papel }: { papel: "professor" | "aluno" }) {
  const [estado, acao, enviando] = useActionState(cadastrar, null);

  useEffect(() => {
    if (estado?.sucesso) registrarEvento("sign_up", { method: "email", papel });
  }, [estado, papel]);

  if (estado?.sucesso) return <Mensagem estado={estado} />;

  return (
    <form action={acao} className="space-y-4">
      <input type="hidden" name="papel" value={papel} />
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
      <label className="flex items-start gap-2.5 text-sm text-tinta-suave">
        <input type="checkbox" name="aceite" required className={`${caixaMarcar} mt-0.5`} />
        <span>
          Li e aceito os{" "}
          <Link href="/termos" target="_blank" className="font-bold text-primaria hover:underline">termos de uso</Link> e a{" "}
          <Link href="/privacidade" target="_blank" className="font-bold text-primaria hover:underline">política de privacidade</Link>.
          Tenho 18 anos ou mais, ou meu responsável sabe e autorizou.
        </span>
      </label>
      <Mensagem estado={estado} />
      <button type="submit" disabled={enviando} className={`${botaoPrimario} w-full`}>
        {enviando ? "Criando..." : "Criar conta grátis"}
      </button>
    </form>
  );
}
