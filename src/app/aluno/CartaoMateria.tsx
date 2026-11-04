import Link from "next/link";
import { cores, type Cor } from "@/lib/mapas";

export function CartaoMateria({ id, nome, cor, total }: { id: string; nome: string; cor: string; total: number }) {
  const c = cores[(cor as Cor) in cores ? (cor as Cor) : "menta"];
  return (
    <Link
      href={`/aluno/materias/${id}`}
      className="block h-full rounded-2xl border-2 p-4 transition-opacity hover:opacity-90"
      style={{ borderColor: c.traco, background: c.fundo, color: "#10233a" }}
    >
      <span className="block font-bold">{nome}</span>
      <span className="mt-1 block text-sm opacity-75">
        {total} {total === 1 ? "resumo" : "resumos"}
      </span>
    </Link>
  );
}
