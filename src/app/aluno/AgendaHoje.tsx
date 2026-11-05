import Link from "next/link";
import type { ReactNode } from "react";
import { quandoItem, type ItemHoje, type TipoItemHoje } from "@/lib/hoje";

// Card "Agenda" do início: o que é de hoje e o que ficou atrasado. Ícones de traço, nada de emoji.

const traco = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const caminhos: Record<TipoItemHoje | "atraso", ReactNode> = {
  aula: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </>
  ),
  atividade: (
    <>
      <path d="M9 4h6a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1Z" />
      <path d="M16 5h2a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h2" />
      <path d="m9 13 2 2 4-4" />
    </>
  ),
  compromisso: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </>
  ),
  calendario: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </>
  ),
  atraso: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
};

function Icone({ nome, className = "size-4" }: { nome: keyof typeof caminhos; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...traco}>
      {caminhos[nome]}
    </svg>
  );
}

const MAX = 5;

export function AgendaHoje({
  itens,
  proxima,
  pedidosAguardando,
  podeMarcar,
  className = "",
}: {
  itens: ItemHoje[];
  proxima: { quando: string; oque: string } | null;
  pedidosAguardando: number;
  podeMarcar: boolean;
  className?: string;
}) {
  const atrasados = itens.filter((i) => i.atrasado).length;
  const deHoje = itens.length - atrasados;
  const visiveis = itens.slice(0, MAX);

  return (
    <section aria-labelledby="agenda-hoje" className={`rounded-2xl bg-primaria-suave p-5 sm:p-6 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="agenda-hoje" className="text-sm font-bold tracking-wide text-primaria uppercase">
          Agenda de hoje
        </h2>
        {atrasados > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-erro-fundo px-2.5 py-0.5 text-xs font-bold text-erro">
            <Icone nome="atraso" className="size-3.5" />
            {atrasados} {atrasados === 1 ? "atrasado" : "atrasados"}
          </span>
        )}
      </div>

      {itens.length === 0 ? (
        <>
          <p className="mt-2 text-xl font-extrabold">Nada para hoje</p>
          {proxima ? (
            <p className="mt-0.5 text-tinta-suave">
              Próxima aula: <span className="inline-block first-letter:uppercase">{proxima.quando}</span> · {proxima.oque}
            </p>
          ) : (
            <p className="mt-0.5 text-tinta-suave">Nenhuma aula marcada.</p>
          )}
        </>
      ) : (
        <>
          <p className="mt-2 text-xl font-extrabold">
            {deHoje > 0 ? `${deHoje} ${deHoje === 1 ? "coisa" : "coisas"} para hoje` : "Nada novo para hoje"}
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {visiveis.map((i) => (
              <li key={i.chave}>
                <Link
                  href={i.href}
                  className={`flex items-center gap-3 rounded-xl border-2 bg-fundo px-3 py-2.5 transition-colors ${
                    i.atrasado ? "border-erro/40 hover:border-erro" : "border-transparent hover:border-primaria"
                  }`}
                >
                  <span
                    className={`grid size-8 shrink-0 place-items-center rounded-full ${
                      i.atrasado ? "bg-erro-fundo text-erro" : "bg-primaria-suave text-primaria"
                    }`}
                  >
                    <Icone nome={i.tipo} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold">{i.titulo}</span>
                    {i.detalhe && <span className="block truncate text-sm text-tinta-suave">{i.detalhe}</span>}
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      i.atrasado ? "bg-erro-fundo text-erro" : "bg-suave text-tinta-suave"
                    }`}
                  >
                    {quandoItem(i)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {itens.length > MAX && <p className="mt-2 text-sm text-tinta-suave">E mais {itens.length - MAX} na agenda.</p>}
        </>
      )}

      {pedidosAguardando > 0 && (
        <p className="mt-2 text-sm font-semibold text-tinta-suave">
          {pedidosAguardando} {pedidosAguardando === 1 ? "pedido de aula aguardando" : "pedidos de aula aguardando"} o professor
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-4">
        <Link href="/aluno/agenda" className="text-sm font-bold text-primaria hover:underline">
          Ver agenda
        </Link>
        {podeMarcar && (
          <Link href="/aluno/agenda#marcar" className="text-sm font-bold text-primaria hover:underline">
            Marcar uma aula
          </Link>
        )}
      </div>
    </section>
  );
}
