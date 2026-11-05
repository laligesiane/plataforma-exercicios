import Link from "next/link";
import { cores, type Cor } from "@/lib/mapas";
import { temMapa } from "@/lib/pedidos";
import type { ResumoComOrigem } from "./dados";

const formatoData = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short", timeZone: "America/Sao_Paulo" });

/** Cartões de resumos agrupados por matéria ou turma. */
export function ListaResumos({ resumos, vazio, agrupar = true }: { resumos: ResumoComOrigem[]; vazio: string; agrupar?: boolean }) {
  if (resumos.length === 0) {
    return <p className="mt-8 rounded-2xl border border-dashed border-linha p-5 text-sm text-tinta-suave">{vazio}</p>;
  }

  const grupos = new Map<string, ResumoComOrigem[]>();
  for (const r of resumos) {
    const chave = agrupar ? r.origem : "";
    grupos.set(chave, [...(grupos.get(chave) ?? []), r]);
  }

  return (
    <div className="mt-8 space-y-8">
      {[...grupos].map(([origem, lista]) => (
        <section key={origem || "todos"}>
          {origem && <h2 className="text-lg font-bold">{origem}</h2>}
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {lista.map((r) => {
              const cor = r.cor_materia ? cores[(r.cor_materia as Cor) in cores ? (r.cor_materia as Cor) : "menta"] : null;
              return (
                <li key={r.id}>
                  <Link
                    href={`/aluno/resumos/${r.id}`}
                    className="flex h-full gap-3 rounded-2xl border border-linha p-5 transition-colors hover:border-primaria"
                  >
                    {cor && <span aria-hidden className="mt-1.5 size-3 shrink-0 rounded-full" style={{ background: cor.traco }} />}
                    <span>
                      <span className="block font-bold">{r.titulo_exibido}</span>
                      <span className="mt-1 block text-sm text-tinta-suave">
                        {[!agrupar && r.origem, temMapa(r) ? "Com mapa mental" : "Resumo", formatoData.format(new Date(r.atualizado_em))]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
