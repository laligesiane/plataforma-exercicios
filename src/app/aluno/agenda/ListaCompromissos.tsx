import { BotaoExcluir } from "@/components/BotaoExcluir";
import { formatarData } from "@/lib/aulas";
import { atrasado, rotuloTipo, type Compromisso } from "@/lib/compromissos";
import { excluirCompromisso, marcarCompromisso } from "./actions";
import { FormularioCompromisso } from "./FormularioCompromisso";

/** Itens da agenda pessoal: marcar como feito, ver nota e anotação, editar e excluir. */
export function ListaCompromissos({ itens, hoje }: { itens: Compromisso[]; hoje: string }) {
  return (
    <ul className="divide-y divide-linha rounded-2xl border border-linha">
      {itens.map((c) => {
        const vencido = atrasado(c, hoje);
        return (
          <li key={c.id} className="px-5 py-3.5">
            <div className="flex items-start gap-3">
              <form action={marcarCompromisso} className="pt-0.5">
                <input type="hidden" name="id" value={c.id} />
                <input type="hidden" name="feito" value={String(!c.feito)} />
                <button
                  type="submit"
                  aria-label={c.feito ? `Marcar "${c.titulo}" como não feito` : `Marcar "${c.titulo}" como feito`}
                  className={`flex size-6 items-center justify-center rounded-md border-2 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-primaria ${
                    c.feito ? "border-primaria bg-primaria text-white" : "border-linha hover:border-primaria"
                  }`}
                >
                  {c.feito ? "✓" : ""}
                </button>
              </form>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <span className={`font-bold ${c.feito ? "text-tinta-suave line-through" : ""}`}>{c.titulo}</span>
                  <span className={`text-sm font-semibold ${vencido ? "text-erro" : "text-primaria"}`}>
                    {vencido && "Atrasado · "}
                    {c.data === hoje ? "Hoje" : formatarData(c.data)}
                    {c.hora && ` às ${c.hora.slice(0, 5)}`}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-tinta-suave">
                  {rotuloTipo[c.tipo]}
                  {c.materia && ` · ${c.materia}`}
                  {c.nota && (
                    <span className="ml-2 rounded-full bg-certo-fundo px-2.5 py-0.5 text-xs font-bold text-certo">Nota {c.nota}</span>
                  )}
                </p>
                {c.anotacao && <p className="mt-1.5 text-sm whitespace-pre-line">{c.anotacao}</p>}
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm font-bold text-primaria">
                    {c.feito && !c.nota ? "Editar, pôr nota ou anotar" : "Editar ou anotar"}
                  </summary>
                  <div className="mt-3 space-y-4 rounded-xl bg-suave p-4">
                    <FormularioCompromisso compromisso={c} hoje={hoje} />
                    <BotaoExcluir
                      acao={excluirCompromisso}
                      campos={{ id: c.id }}
                      pergunta={`Excluir "${c.titulo}" da sua agenda?`}
                      discreto
                    />
                  </div>
                </details>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
