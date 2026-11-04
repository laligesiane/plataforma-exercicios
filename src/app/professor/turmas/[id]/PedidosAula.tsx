import { botaoPrimario, botaoSecundario } from "@/components/ui/estilos";
import { formatarData } from "@/lib/aulas";
import { aceitarPedido, recusarPedido } from "./actions-pedidos";

export type PedidoDaTurma = {
  id: string;
  data: string;
  hora: string | null;
  mensagem: string;
  perfil: { nome: string | null; email: string } | null;
};

/** Pedidos de aula pendentes dos alunos da turma, com Aceitar e Recusar. */
export function PedidosAula({ pedidos, turmaId }: { pedidos: PedidoDaTurma[]; turmaId: string }) {
  if (pedidos.length === 0) return null;

  return (
    <section className="mt-8 rounded-2xl border-2 border-primaria p-5 sm:p-6">
      <h2 className="text-lg font-bold">Pedidos de aula</h2>
      <p className="mt-1 text-sm text-tinta-suave">
        Ao aceitar, a aula entra no dia pedido e aparece na agenda dos alunos. Depois você pode editar ou registrar o que foi visto.
      </p>
      <ul className="mt-4 divide-y divide-linha">
        {pedidos.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <span>
              <span className="block font-bold">
                {formatarData(p.data)}
                {p.hora && ` às ${p.hora.slice(0, 5)}`}
              </span>
              <span className="text-sm text-tinta-suave">
                {p.perfil?.nome || p.perfil?.email || "Aluno"}
                {p.mensagem && ` · ${p.mensagem}`}
              </span>
            </span>
            <span className="flex gap-2">
              <form action={recusarPedido}>
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="turma_id" value={turmaId} />
                <button type="submit" className={botaoSecundario}>
                  Recusar
                </button>
              </form>
              <form action={aceitarPedido}>
                <input type="hidden" name="id" value={p.id} />
                <button type="submit" className={`${botaoPrimario} px-4 py-1.5 text-sm`}>
                  Aceitar
                </button>
              </form>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
