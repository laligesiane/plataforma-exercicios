import Link from "next/link";
import { notFound } from "next/navigation";
import { Cabecalho } from "@/components/Cabecalho";
import { BotaoExcluir } from "@/components/BotaoExcluir";
import { botaoPrimario } from "@/components/ui/estilos";
import { cores, type Cor } from "@/lib/mapas";
import { exigirPapel } from "@/lib/perfil";
import { camposResumo, tituloResumo, type Resumo } from "@/lib/resumos";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { apagarMateria, apagarResumoAluno } from "../actions";

const formatoData = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short" });

export default async function PaginaMateria({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await exigirPapel("aluno");
  const supabase = await criarClienteServidor();
  const [{ data: materia }, { data: resumosDb }] = await Promise.all([
    supabase.from("materia").select("id, nome, cor").eq("id", id).maybeSingle(),
    supabase.from("resumo").select(camposResumo).eq("materia_id", id).order("atualizado_em", { ascending: false }),
  ]);
  if (!materia) notFound();
  const resumos = (resumosDb ?? []) as Resumo[];
  const cor = cores[(materia.cor as Cor) in cores ? (materia.cor as Cor) : "menta"];

  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-3xl px-4 pt-8 pb-16">
        <Link href="/aluno" className="text-sm font-bold text-primaria hover:underline">
          ← Meu painel
        </Link>
        <h1 className="mt-3 flex items-center gap-3 text-3xl font-extrabold tracking-tight">
          <span aria-hidden className="size-4 rounded-full" style={{ background: cor.traco }} />
          {materia.nome}
        </h1>
        <p className="mt-2 text-tinta-suave">Seus resumos e mapas mentais desta matéria. Só você vê.</p>

        <Link href={`/aluno/materias/${materia.id}/resumos/novo`} className={`${botaoPrimario} mt-6 inline-block`}>
          Novo resumo ou mapa mental
        </Link>

        {resumos.length > 0 ? (
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {resumos.map((r) => (
              <li key={r.id} className="flex flex-col rounded-2xl border border-linha transition-colors hover:border-primaria">
                <Link href={`/aluno/resumos/${r.id}`} className="block grow p-5 pb-3">
                  <span className="block font-bold">{tituloResumo(r)}</span>
                  <span className="mt-1 block text-sm text-tinta-suave">
                    {r.mapa?.ramos?.length ? `Com mapa mental` : "Resumo"} ·{" "}
                    {formatoData.format(new Date(r.atualizado_em))}
                  </span>
                </Link>
                <div className="flex items-baseline gap-4 px-5 pb-4">
                  <Link
                    href={`/aluno/materias/${materia.id}/resumos/${r.id}`}
                    className="text-sm font-bold text-primaria underline-offset-4 hover:underline"
                  >
                    Editar
                  </Link>
                  <BotaoExcluir
                    acao={apagarResumoAluno}
                    campos={{ id: r.id, materia_id: materia.id }}
                    pergunta={`Excluir "${tituloResumo(r)}"? Não dá para desfazer.`}
                    discreto
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 rounded-2xl border border-dashed border-linha p-5 text-sm text-tinta-suave">
            Nenhum resumo ainda. Comece com um mapa mental do último assunto que você estudou.
          </p>
        )}

        <BotaoExcluir
          acao={apagarMateria}
          campos={{ id: materia.id }}
          rotulo="Excluir matéria e seus resumos"
          pergunta={`Excluir a matéria "${materia.nome}" e todos os resumos dela? Não dá para desfazer.`}
          className="mt-10 border-t border-linha pt-6"
        />
      </main>
    </>
  );
}
