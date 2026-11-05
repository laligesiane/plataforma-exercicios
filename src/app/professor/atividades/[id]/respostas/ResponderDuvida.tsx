"use client";

import { useActionState } from "react";
import { botaoSecundario, campo } from "@/components/ui/estilos";
import { responderDuvida } from "../../actions";

export function ResponderDuvida({ id, atividadeId, resposta }: { id: number; atividadeId: string; resposta: string | null }) {
  const [estado, acao, enviando] = useActionState(responderDuvida, null);
  return (
    <form action={acao} className="mt-2">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="atividade_id" value={atividadeId} />
      <textarea
        name="resposta"
        defaultValue={resposta ?? ""}
        rows={2}
        maxLength={2000}
        aria-label="Sua resposta"
        placeholder="Explique para o aluno. Ele vê a resposta embaixo do exercício."
        className={`${campo} text-sm`}
      />
      <div className="mt-1.5 flex items-center gap-3">
        <button type="submit" disabled={enviando} className={botaoSecundario}>
          {enviando ? "Salvando..." : resposta ? "Atualizar resposta" : "Responder"}
        </button>
        {estado?.erro && <span className="text-sm text-erro">{estado.erro}</span>}
        {estado?.ok && <span className="text-sm text-certo">Resposta enviada.</span>}
      </div>
    </form>
  );
}
