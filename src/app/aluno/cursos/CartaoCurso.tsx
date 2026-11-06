import { fmt } from "@/i18n/config";
import { obterDicionario } from "@/i18n/servidor";
import Link from "next/link";
import { Icone } from "@/components/jogos/Icones";
import { progressoCurso } from "@/lib/cursos";
import { cores, type Cor } from "@/lib/mapas";


/** Cartão do curso na lista: nome, quantas matérias e resumos, etapa e a barrinha de progresso. */
export async function CartaoCurso({
  href,
  nome,
  materias,
  resumos,
  coresMaterias = [],
  inicio = null,
  duracaoMeses = null,
  etapa = null,
  discreto = false,
}: {
  href: string;
  nome: string;
  materias: number;
  resumos: number;
  coresMaterias?: string[];
  inicio?: string | null;
  duracaoMeses?: number | null;
  etapa?: string | null;
  /** Para o grupo "Sem curso": borda tracejada. */
  discreto?: boolean;
}) {
  const d = await obterDicionario();
  const tx = d.cursos;
  const p = progressoCurso(inicio, duracaoMeses, undefined, d.datas);
  return (
    <Link
      href={href}
      className={`group flex h-full items-center gap-4 rounded-3xl border-2 p-4 transition-colors hover:border-primaria sm:flex-col sm:items-stretch sm:p-5 ${
        discreto ? "border-dashed border-linha" : "border-linha bg-fundo"
      }`}
    >
      <span
        className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${
          discreto ? "bg-suave text-tinta-suave" : "bg-primaria-suave text-primaria"
        }`}
      >
        <Icone nome="pasta" className="size-6" />
      </span>
      <span className="min-w-0 grow">
        <span className="block truncate text-lg leading-tight font-extrabold group-hover:text-primaria">{nome}</span>
        <span className="mt-0.5 block text-sm text-tinta-suave">
          {materias === 1 ? tx.materias1 : fmt(tx.materiasN, { n: materias })} · {resumos === 1 ? d.aluno.resumos1 : fmt(d.aluno.resumosN, { n: resumos })}
        </span>
        {coresMaterias.length > 0 && (
          <span className="mt-2 flex gap-1" aria-hidden>
            {coresMaterias.slice(0, 8).map((c, i) => (
              <span
                key={i}
                className="size-2.5 rounded-full"
                style={{ background: cores[(c as Cor) in cores ? (c as Cor) : "menta"].traco }}
              />
            ))}
          </span>
        )}
        {(etapa || p) && (
          <span className="mt-3 block">
            <span className="flex items-baseline justify-between gap-2 text-xs">
              <span className="truncate font-bold">{etapa ?? ""}</span>
              {p && <span className="shrink-0 font-bold text-tinta-suave tabular-nums">{p.porcentagem}%</span>}
            </span>
            {p && (
              <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-linha" aria-hidden>
                <span
                  className={`block h-full rounded-full ${p.situacao === "terminou" ? "bg-certo" : "bg-primaria"}`}
                  style={{ width: `${p.porcentagem}%` }}
                />
              </span>
            )}
            {p && <span className="sr-only">{fmt(tx.porcentagemCurso, { p: p.porcentagem, falta: p.falta })}</span>}
          </span>
        )}
      </span>
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className="size-5 shrink-0 text-tinta-suave group-hover:text-primaria sm:hidden"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m9 6 6 6-6 6" />
      </svg>
    </Link>
  );
}
