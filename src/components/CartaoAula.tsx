import Link from "next/link";
import { formatarData, tituloAula, type Aula } from "@/lib/aulas";

/** Resumo de uma aula: o que foi visto, para a próxima aula e para casa. */
export function CartaoAula({
  aula,
  destaque,
  resumos = [],
}: {
  aula: Aula;
  destaque?: string;
  resumos?: { id: string; titulo: string; href: string }[];
}) {
  const blocos = [
    { rotulo: "O que foi visto", texto: aula.resumo },
    { rotulo: "Para a próxima aula", texto: aula.proximos_passos },
    { rotulo: "Para casa", texto: aula.tarefa },
  ].filter((b) => b.texto.trim());

  return (
    <article className="rounded-2xl border border-linha p-5">
      <p className="text-sm text-tinta-suave">
        {destaque && <span className="mr-2 font-bold text-primaria">{destaque}</span>}
        {formatarData(aula.data)}
      </p>
      <h3 className="mt-1 font-bold">{tituloAula(aula)}</h3>
      {blocos.length > 0 && (
        <dl className="mt-3 space-y-3">
          {blocos.map((b) => (
            <div key={b.rotulo}>
              <dt className="text-xs font-bold tracking-wide text-tinta-suave uppercase">{b.rotulo}</dt>
              <dd className="mt-0.5 whitespace-pre-line">{b.texto}</dd>
            </div>
          ))}
        </dl>
      )}
      {resumos.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {resumos.map((r) => (
            <li key={r.id}>
              <Link
                href={r.href}
                className="inline-block rounded-full bg-primaria-suave px-3 py-1 text-sm font-bold text-primaria hover:opacity-90"
              >
                Resumo: {r.titulo}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
