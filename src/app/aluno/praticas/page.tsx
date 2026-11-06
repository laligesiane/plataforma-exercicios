import Link from "next/link";
import { exigirPapel } from "@/lib/perfil";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { LayoutConta } from "../LayoutConta";
import { contarItens } from "./dados";

const formatoData = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short" });

export default async function MinhasPraticas() {
  await exigirPapel("aluno");
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("pratica")
    .select("id, titulo, exercicios, criada_em, resumo(id, titulo)")
    .order("criada_em", { ascending: false });
  const praticas = data ?? [];

  return (
    <LayoutConta titulo="Minhas práticas" descricao="Atividades que você gerou a partir dos seus resumos, para treinar sozinho.">
      {praticas.length > 0 ? (
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {praticas.map((p) => {
            const resumo = p.resumo as unknown as { id: string; titulo: string } | null;
            const itens = contarItens(p.exercicios);
            return (
              <li key={p.id}>
                <Link
                  href={`/aluno/praticas/${p.id}`}
                  className="block h-full rounded-2xl border border-linha p-5 transition-colors hover:border-primaria"
                >
                  <span className="block font-bold">{p.titulo}</span>
                  <span className="mt-1 block text-sm text-tinta-suave">
                    {[resumo?.titulo?.trim() && `De: ${resumo.titulo}`, `${itens} ${itens === 1 ? "item" : "itens"}`, formatoData.format(new Date(p.criada_em))]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-linha p-6 text-center">
          <p className="font-semibold">Nenhuma prática ainda.</p>
          <p className="mt-1 text-sm text-tinta-suave">Abra um resumo e toque em &quot;Gerar atividade&quot; para treinar com ele.</p>
          <Link href="/aluno/cursos" className="mt-3 inline-block text-sm font-bold text-primaria hover:underline">
            Ver meus resumos
          </Link>
        </div>
      )}
    </LayoutConta>
  );
}
