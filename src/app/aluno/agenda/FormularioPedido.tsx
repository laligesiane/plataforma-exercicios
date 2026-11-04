"use client";

import { useActionState } from "react";
import { Mensagem } from "@/components/ui/Mensagem";
import { botaoPrimario, campo, rotulo } from "@/components/ui/estilos";
import { pedirAula } from "./actions";

export function FormularioPedido({ turmas, hoje }: { turmas: { id: string; nome: string }[]; hoje: string }) {
  const [estado, acao, enviando] = useActionState(pedirAula, null);

  return (
    <form action={acao} className="space-y-4">
      {turmas.length > 1 ? (
        <div>
          <label htmlFor="pedido-turma" className={rotulo}>
            Turma
          </label>
          <select id="pedido-turma" name="turma_id" required className={campo}>
            {turmas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <input type="hidden" name="turma_id" value={turmas[0]?.id ?? ""} />
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pedido-data" className={rotulo}>
            Dia
          </label>
          <input id="pedido-data" type="date" name="data" required min={hoje} className={campo} />
        </div>
        <div>
          <label htmlFor="pedido-hora" className={rotulo}>
            Horário <span className="font-normal text-tinta-suave">(opcional)</span>
          </label>
          <input id="pedido-hora" type="time" name="hora" className={campo} />
        </div>
      </div>
      <div>
        <label htmlFor="pedido-mensagem" className={rotulo}>
          Recado para o professor <span className="font-normal text-tinta-suave">(opcional)</span>
        </label>
        <textarea
          id="pedido-mensagem"
          name="mensagem"
          rows={3}
          maxLength={1000}
          placeholder="Ex.: queria revisar o pretérito antes da prova."
          className={campo}
        />
      </div>
      <Mensagem estado={estado} />
      <button type="submit" disabled={enviando} className={botaoPrimario}>
        {enviando ? "Enviando..." : "Pedir aula"}
      </button>
    </form>
  );
}
