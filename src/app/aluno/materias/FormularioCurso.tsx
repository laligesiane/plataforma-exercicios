"use client";

import { useActionState, useEffect, useRef } from "react";
import { Mensagem } from "@/components/ui/Mensagem";
import { botaoPrimario, botaoSecundario, campo, rotulo } from "@/components/ui/estilos";
import { criarCurso, renomearCurso } from "./actions";

export function FormularioCurso() {
  const [estado, acao, enviando] = useActionState(criarCurso, null);
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (estado?.sucesso) form.current?.reset();
  }, [estado]);

  return (
    <form ref={form} action={acao} className="space-y-4">
      <div>
        <label htmlFor="nome-curso" className={rotulo}>
          Nome do curso
        </label>
        <input
          id="nome-curso"
          name="nome"
          required
          maxLength={80}
          placeholder="Ex.: Espanhol, Faculdade, Ensino médio"
          className={campo}
        />
      </div>
      <Mensagem estado={estado} />
      <button type="submit" disabled={enviando} className={botaoPrimario}>
        {enviando ? "Criando..." : "Criar curso"}
      </button>
    </form>
  );
}

export function FormularioRenomearCurso({ id, nome }: { id: string; nome: string }) {
  const [estado, acao, enviando] = useActionState(renomearCurso, null);
  return (
    <form action={acao} className="mt-3 space-y-3">
      <input type="hidden" name="id" value={id} />
      <label className="sr-only" htmlFor={`renomear-${id}`}>
        Novo nome do curso
      </label>
      <div className="flex flex-wrap gap-2">
        <input id={`renomear-${id}`} name="nome" required maxLength={80} defaultValue={nome} className={`${campo} max-w-xs`} />
        <button type="submit" disabled={enviando} className={botaoSecundario}>
          {enviando ? "Salvando..." : "Salvar nome"}
        </button>
      </div>
      <Mensagem estado={estado} />
    </form>
  );
}
