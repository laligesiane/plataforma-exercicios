"use client";

import { useActionState, useEffect, useRef } from "react";
import { Mensagem } from "@/components/ui/Mensagem";
import { botaoPrimario, caixaMarcar, campo, rotulo } from "@/components/ui/estilos";
import { convidarAluno } from "../../actions";

export function FormularioConvite({ turmaId }: { turmaId: string }) {
  const [estado, acao, enviando] = useActionState(convidarAluno, null);
  const formulario = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // Limpa só nome e e-mail: a confirmação de autorização continua marcada para o próximo convite.
    if (!estado?.sucesso || !formulario.current) return;
    for (const nome of ["nome", "email"]) {
      const campo = formulario.current.elements.namedItem(nome);
      if (campo instanceof HTMLInputElement) campo.value = "";
    }
  }, [estado]);

  return (
    <form ref={formulario} action={acao} className="space-y-4">
      <input type="hidden" name="turma_id" value={turmaId} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="nome" className={rotulo}>
            Nome do aluno
          </label>
          <input id="nome" name="nome" required className={campo} />
        </div>
        <div>
          <label htmlFor="email" className={rotulo}>
            E-mail
          </label>
          <input id="email" name="email" type="email" required className={campo} />
        </div>
      </div>
      <label className="flex items-start gap-2.5 text-sm text-tinta-suave">
        <input type="checkbox" name="autorizacao" required className={`${caixaMarcar} mt-0.5`} />
        <span>Esse aluno quer participar da turma e, se for menor de idade, a escola ou a família autorizou.</span>
      </label>
      <Mensagem estado={estado} />
      <button type="submit" disabled={enviando} className={botaoPrimario}>
        {enviando ? "Enviando..." : "Enviar convite"}
      </button>
    </form>
  );
}
