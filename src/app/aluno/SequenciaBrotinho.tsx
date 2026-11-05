import { Mascote } from "@/components/Mascote";
import { META_SEMANA, fraseDoBrotinho, semanaAtual, sequenciaAtual } from "@/lib/sequencia";

const iniciais = ["S", "T", "Q", "Q", "S", "S", "D"];
const nomes = ["segunda", "terça", "quarta", "quinta", "sexta", "sábado", "domingo"];

/** Meta leve da semana com o Brotinho: sem ranking, sem cobrança de todo dia. */
export function SequenciaBrotinho({ dias, hoje }: { dias: Set<string>; hoje: string }) {
  const semana = semanaAtual(dias, hoje);
  const naSemana = semana.filter((d) => d.estudou).length;
  const sequencia = sequenciaAtual(dias, hoje);
  const cumpriu = naSemana >= META_SEMANA;
  // O Brotinho cresce com os dias estudados na semana.
  const tamanho = 56 + Math.min(naSemana, 5) * 8;

  return (
    <section className="mt-6 flex items-center gap-4 rounded-2xl border border-linha p-4 sm:p-5">
      <div className="flex size-24 shrink-0 items-end justify-center">
        <Mascote tamanho={tamanho} animado={cumpriu} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-bold">
          {naSemana} de {META_SEMANA} dias nesta semana
          {sequencia > 1 && <span className="font-semibold text-tinta-suave"> · {sequencia} dias seguidos</span>}
        </p>
        <p className="mt-0.5 text-sm text-tinta-suave">{fraseDoBrotinho(naSemana, sequencia, dias.has(hoje))}</p>
        <ol className="mt-2.5 flex gap-1.5" aria-label="Dias estudados nesta semana">
          {semana.map((d, i) => (
            <li
              key={d.data}
              title={`${nomes[i]}: ${d.estudou ? "estudou" : d.futuro ? "ainda não chegou" : "não estudou"}`}
              aria-label={`${nomes[i]}: ${d.estudou ? "estudou" : d.futuro ? "ainda não chegou" : "não estudou"}`}
              className={`flex size-7 items-center justify-center rounded-full text-xs font-bold ${
                d.estudou ? "bg-primaria text-white" : d.futuro ? "border border-dashed border-linha text-tinta-suave" : "bg-suave text-tinta-suave"
              } ${d.hoje ? "outline-2 outline-offset-2 outline-primaria" : ""}`}
            >
              {iniciais[i]}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
