import type { ReactNode } from "react";
import { descreverHorario, linkGoogleAgenda, proximaAula, type Horario } from "@/lib/agenda";

const formatoData = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit", timeZone: "UTC" });

/** Próxima aula e lista de horários, cada um com "Adicionar ao Google Agenda". */
export function HorariosTurma({
  horarios,
  nomeTurma,
  acaoRemover,
  turmaId,
  editar,
}: {
  horarios: (Horario & { id: string })[];
  nomeTurma: string;
  acaoRemover?: (formData: FormData) => Promise<void>;
  turmaId?: string;
  /** Formulário de edição de um horário (só na tela do professor). */
  editar?: (horario: Horario & { id: string }) => ReactNode;
}) {
  if (horarios.length === 0) return null;
  const proxima = proximaAula(horarios);
  const ordenados = [...horarios].sort(
    (a, b) => a.dia_semana - b.dia_semana || a.hora_inicio.localeCompare(b.hora_inicio),
  );

  return (
    <div className="space-y-3">
      {proxima && (
        <p className="rounded-xl bg-primaria-suave px-3.5 py-2.5 text-sm font-semibold text-primaria">
          Próxima aula: {formatoData.format(new Date(Date.UTC(proxima.ano, proxima.mes - 1, proxima.dia)))} às{" "}
          {proxima.horario.hora_inicio.slice(0, 5)}
        </p>
      )}
      <ul className="divide-y divide-linha">
        {ordenados.map((h) => (
          <li key={h.id} className="py-3">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <span className="font-semibold tabular-nums">{descreverHorario(h)}</span>
            <span className="flex items-center gap-4">
              <a
                href={linkGoogleAgenda(h, nomeTurma, `Aula da turma ${nomeTurma} na Repasa`)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold text-primaria hover:underline"
              >
                Adicionar ao Google Agenda
              </a>
              {acaoRemover && (
                <form action={acaoRemover}>
                  <input type="hidden" name="id" value={h.id} />
                  <input type="hidden" name="turma_id" value={turmaId} />
                  <button type="submit" className="text-sm font-bold text-tinta-suave hover:text-tinta">
                    Remover
                  </button>
                </form>
              )}
            </span>
            </div>
            {editar && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm font-bold text-tinta-suave hover:text-tinta">Editar</summary>
                <div className="mt-3 rounded-xl bg-suave p-4">{editar(h)}</div>
              </details>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
