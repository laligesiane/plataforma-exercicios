import Link from "next/link";
import { icones } from "@/components/navegacao";
import { hojeNoFuso } from "@/lib/aulas";
import { criarClienteServidor } from "@/lib/supabase/servidor";

/**
 * Entrada do "Repasar meus erros" dentro de Atividades (saiu do menu principal).
 * Busca a própria contagem para a página de atividades só precisar de uma linha.
 */
export async function CartaoRepasar({ alunoId }: { alunoId: string }) {
  const supabase = await criarClienteServidor();
  const hoje = hojeNoFuso();
  const [{ count: paraHoje }, { count: depois }] = await Promise.all([
    supabase
      .from("revisao")
      .select("id", { count: "exact", head: true })
      .eq("aluno_id", alunoId)
      .is("concluida_em", null)
      .lte("proxima_em", hoje),
    supabase
      .from("revisao")
      .select("id", { count: "exact", head: true })
      .eq("aluno_id", alunoId)
      .is("concluida_em", null)
      .gt("proxima_em", hoje),
  ]);
  const hojeN = paraHoje ?? 0;
  const depoisN = depois ?? 0;

  return (
    <Link
      href="/aluno/revisar"
      className={`mt-6 flex items-center gap-4 rounded-2xl border-2 p-4 transition-colors hover:bg-primaria-suave ${
        hojeN > 0 ? "border-primaria" : "border-linha hover:border-primaria"
      }`}
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primaria-suave text-primaria" aria-hidden>
        {icones.repasar}
      </span>
      <span className="min-w-0 grow">
        <span className="block font-extrabold">Repasar meus erros</span>
        <span className="block text-sm text-tinta-suave">
          {hojeN > 0
            ? `${hojeN} ${hojeN === 1 ? "item que você errou volta" : "itens que você errou voltam"} hoje. Leva poucos minutos.`
            : depoisN > 0
              ? `Nada para hoje. ${depoisN} ${depoisN === 1 ? "item volta" : "itens voltam"} nos próximos dias.`
              : "Os itens que você errar nas atividades voltam aqui para você repassar."}
        </span>
      </span>
      <span
        className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-bold ${hojeN > 0 ? "bg-primaria text-white" : "bg-suave text-tinta-suave"}`}
      >
        {hojeN > 0 ? "Começar" : "Abrir"}
      </span>
    </Link>
  );
}
