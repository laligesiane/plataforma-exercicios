"use client";

import { useActionState } from "react";
import { Mensagem } from "@/components/ui/Mensagem";
import { botaoPrimario, campo, rotulo } from "@/components/ui/estilos";
import { diasDaSemana, type Horario } from "@/lib/agenda";
import { salvarHorario } from "../../actions";

/** Sem `horario`: adiciona um novo. Com `horario`: edita aquele. */
export function FormularioHorario({ turmaId, horario }: { turmaId: string; horario?: Horario & { id: string } }) {
  const [estado, acao, enviando] = useActionState(salvarHorario, null);
  const sufixo = horario?.id ?? "novo";

  return (
    <form action={acao} className="space-y-4">
      <input type="hidden" name="turma_id" value={turmaId} />
      {horario && <input type="hidden" name="id" value={horario.id} />}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor={`dia-${sufixo}`} className={rotulo}>
            Dia
          </label>
          <select id={`dia-${sufixo}`} name="dia_semana" defaultValue={String(horario?.dia_semana ?? 1)} className={campo}>
            {diasDaSemana.map((dia, i) => (
              <option key={dia} value={i}>
                {dia}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`inicio-${sufixo}`} className={rotulo}>
            Começa às
          </label>
          <input
            id={`inicio-${sufixo}`}
            name="hora_inicio"
            type="time"
            required
            defaultValue={horario?.hora_inicio.slice(0, 5) ?? "19:00"}
            className={campo}
          />
        </div>
        <div>
          <label htmlFor={`duracao-${sufixo}`} className={rotulo}>
            Duração (min)
          </label>
          <input
            id={`duracao-${sufixo}`}
            name="duracao_min"
            type="number"
            min={15}
            max={480}
            step={5}
            required
            defaultValue={horario?.duracao_min ?? 60}
            className={campo}
          />
        </div>
      </div>
      <Mensagem estado={estado} />
      <button type="submit" disabled={enviando} className={botaoPrimario}>
        {enviando ? "Salvando..." : horario ? "Salvar alterações" : "Adicionar horário"}
      </button>
    </form>
  );
}
