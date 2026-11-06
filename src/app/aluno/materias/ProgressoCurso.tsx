import { LANG_HTML, fmt } from "@/i18n/config";
import { obterDicionario, obterIdioma } from "@/i18n/servidor";
import { descreverDuracao, progressoCurso } from "@/lib/cursos";
import type { CursoCompleto } from "./FormularioCurso";


/** Etapa atual, datas e a barra de quanto já foi do curso. Some se o curso não tiver início e duração. */
export async function ProgressoCurso({ curso, hoje }: { curso: CursoCompleto; hoje?: Date }) {
  const [d, idioma] = await Promise.all([obterDicionario(), obterIdioma()]);
  const tx = d.cursos;
  const mesAno = new Intl.DateTimeFormat(LANG_HTML[idioma], { month: "short", year: "numeric" });
  const dataLonga = new Intl.DateTimeFormat(LANG_HTML[idioma], { day: "numeric", month: "short", year: "numeric" });
  const p = progressoCurso(curso.inicio, curso.duracao_meses, hoje, d.datas);
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
            aria-label={fmt(tx.progresso, { curso: curso.nome })}
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
              {tx.inicio} <time dateTime={curso.inicio ?? undefined}>{mesAno.format(p.inicio)}</time>
              {curso.duracao_meses ? ` · ${descreverDuracao(curso.duracao_meses, d.datas).texto}` : ""}
            </span>
            <span className="font-bold tabular-nums">{p.porcentagem}%</span>
            <span>
              {tx.terminaEm} <time>{dataLonga.format(p.fim)}</time>
            </span>
          </div>
        </>
      )}
    </div>
  );
}
