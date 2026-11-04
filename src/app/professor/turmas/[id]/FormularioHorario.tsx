"use client";

import { useActionState } from "react";
import { Mensagem } from "@/components/ui/Mensagem";
import { botaoPrimario, campo, rotulo } from "@/components/ui/estilos";
import { diasDaSemana } from "@/lib/agenda";
import { adicionarHorario } from "../../actions";

export function FormularioHorario({ turmaId }: { turmaId: string }) {
  const [estado, acao, enviando] = useActionState(adicionarHorario, null);

  return (
    <form action={acao} className="space-y-4">
      <input type="hidden" name="turma_id" value={turmaId} />
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="dia_semana" className={rotulo}>
            Dia
          </label>
          <select id="dia_semana" name="dia_semana" defaultValue="1" className={campo}>
            {diasDaSemana.map((dia, i) => (
              <option key={dia} value={i}>
                {dia}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="hora_inicio" className={rotulo}>
            Começa às
          </label>
          <input id="hora_inicio" name="hora_inicio" type="time" required defaultValue="19:00" className={campo} />
        </div>
        <div>
          <label htmlFor="duracao_min" className={rotulo}>
            Duração (min)
          </label>
          <input
            id="duracao_min"
            name="duracao_min"
            type="number"
            min={15}
            max={480}
            step={5}
            required
            defaultValue={60}
            className={campo}
          />
        </div>
      </div>
      <Mensagem estado={estado} />
      <button type="submit" disabled={enviando} className={botaoPrimario}>
        {enviando ? "Salvando..." : "Adicionar horário"}
      </button>
    </form>
  );
}
