"use client";

import { useActionState, useEffect, useRef } from "react";
import { Mensagem } from "@/components/ui/Mensagem";
import { botaoPrimario, campo, rotulo } from "@/components/ui/estilos";
import type { Aula } from "@/lib/aulas";
import { salvarAula } from "./actions-aulas";

/** Sem `aula`: registra uma nova. Com `aula`: edita aquela. */
export function FormularioAula({ turmaId, hoje, aula }: { turmaId: string; hoje: string; aula?: Aula }) {
  const [estado, acao, enviando] = useActionState(salvarAula, null);
  const formulario = useRef<HTMLFormElement>(null);
  const s = aula?.id ?? "nova";

  useEffect(() => {
    if (estado?.sucesso && !aula) formulario.current?.reset();
  }, [estado, aula]);

  return (
    <form ref={formulario} action={acao} className="space-y-4">
      <input type="hidden" name="turma_id" value={turmaId} />
      {aula && <input type="hidden" name="id" value={aula.id} />}
      <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
        <div>
          <label htmlFor={`data-${s}`} className={rotulo}>
            Data
          </label>
          <input id={`data-${s}`} name="data" type="date" required defaultValue={aula?.data ?? hoje} className={campo} />
        </div>
        <div>
          <label htmlFor={`titulo-${s}`} className={rotulo}>
            Tema da aula <span className="font-normal text-tinta-suave">(opcional)</span>
          </label>
          <input
            id={`titulo-${s}`}
            name="titulo"
            maxLength={200}
            defaultValue={aula?.titulo}
            placeholder="Ex.: Pretérito imperfeito"
            className={campo}
          />
        </div>
      </div>
      <div>
        <label htmlFor={`resumo-${s}`} className={rotulo}>
          O que foi visto
        </label>
        <textarea
          id={`resumo-${s}`}
          name="resumo"
          rows={4}
          maxLength={5000}
          defaultValue={aula?.resumo}
          placeholder="Os pontos principais, um por linha."
          className={campo}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`passos-${s}`} className={rotulo}>
            Para a próxima aula
          </label>
          <textarea
            id={`passos-${s}`}
            name="proximos_passos"
            rows={3}
            maxLength={3000}
            defaultValue={aula?.proximos_passos}
            placeholder="O que retomar ou começar."
            className={campo}
          />
        </div>
        <div>
          <label htmlFor={`tarefa-${s}`} className={rotulo}>
            Para casa
          </label>
          <textarea
            id={`tarefa-${s}`}
            name="tarefa"
            rows={3}
            maxLength={3000}
            defaultValue={aula?.tarefa}
            placeholder="Tarefa ou atividade para fazer."
            className={campo}
          />
        </div>
      </div>
      <Mensagem estado={estado} />
      <button type="submit" disabled={enviando} className={botaoPrimario}>
        {enviando ? "Salvando..." : aula ? "Salvar alterações" : "Registrar aula"}
      </button>
    </form>
  );
}
