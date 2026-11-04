"use client";

import { useActionState, useEffect, useRef } from "react";
import { Mensagem } from "@/components/ui/Mensagem";
import { botaoPrimario, campo, rotulo } from "@/components/ui/estilos";
import { convidarAluno } from "../../actions";

export function FormularioConvite({ turmaId }: { turmaId: string }) {
  const [estado, acao, enviando] = useActionState(convidarAluno, null);
  const formulario = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado?.sucesso) formulario.current?.reset();
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
      <Mensagem estado={estado} />
      <button type="submit" disabled={enviando} className={botaoPrimario}>
        {enviando ? "Enviando..." : "Enviar convite"}
      </button>
    </form>
  );
}
