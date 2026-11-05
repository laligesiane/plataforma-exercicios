import { descreverDuracao, progressoCurso } from "@/lib/cursos";
import type { CursoCompleto } from "./FormularioCurso";

const mesAno = new Intl.DateTimeFormat("pt-BR", { month: "short", year: "numeric" });
const dataLonga = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short", year: "numeric" });

/** Etapa atual, datas e a barra de quanto já foi do curso. Some se o curso não tiver início e duração. */
export function ProgressoCurso({ curso, hoje }: { curso: CursoCompleto; hoje?: Date }) {
  const p = progressoCurso(curso.inicio, curso.duracao_meses, hoje);
  if (!p && !curso.etapa) return null;

  return (
    <div className="mt-3 rounded-2xl bg-suave p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm">
        {curso.etapa && <span className="font-bold">{curso.etapa}</span>}
        {p && (
          <span className={p.situacao === "terminou" ? "font-bold text-certo" : "text-tinta-suave"}>{p.falta}</span>
        )}
      </div>
      {p && (
        <>
          <div
            role="progressbar"
            aria-label={`Progresso do curso ${curso.nome}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={p.porcentagem}
            aria-valuetext={`${p.porcentagem}%. ${p.falta}`}
            className="mt-2 h-3 overflow-hidden rounded-full bg-linha"
          >
            <div
              className={`h-full rounded-full ${p.situacao === "terminou" ? "bg-certo" : "bg-primaria"}`}
              style={{ width: `${p.porcentagem}%` }}
            />
          </div>
          <div className="mt-1.5 flex flex-wrap justify-between gap-x-4 text-xs text-tinta-suave">
            <span>
              Início: <time dateTime={curso.inicio ?? undefined}>{mesAno.format(p.inicio)}</time>
              {curso.duracao_meses ? ` · ${descreverDuracao(curso.duracao_meses).texto}` : ""}
            </span>
            <span className="font-bold tabular-nums">{p.porcentagem}%</span>
            <span>
              Termina em <time>{dataLonga.format(p.fim)}</time>
            </span>
          </div>
        </>
      )}
    </div>
  );
}
