import Link from "next/link";
import { notFound } from "next/navigation";
import { Cabecalho } from "@/components/Cabecalho";
import { BotaoExcluir } from "@/components/BotaoExcluir";
import { AulaAtividade } from "@/components/exercicios/AulaAtividade";
import { ehUuid } from "@/lib/atividades/modelo";
import { exigirPapel } from "@/lib/perfil";
import { apagarPratica } from "../actions";
import { carregarPratica } from "../dados";

export default async function FazerPratica({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await exigirPapel("aluno");
  if (!ehUuid(id)) notFound();
  const pratica = await carregarPratica(id);
  if (!pratica) notFound();

  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-7xl px-4 pt-8 pb-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <Link
            href={pratica.resumo_id ? `/aluno/resumos/${pratica.resumo_id}` : "/aluno/atividades"}
            className="text-sm font-bold text-primaria hover:underline"
          >
            ← {pratica.resumo_id ? "Voltar ao resumo" : "Minhas atividades"}
          </Link>
          <span className="flex items-baseline gap-4">
            <Link href={`/aluno/praticas/${id}/editar`} className="text-sm font-bold text-primaria hover:underline">
              Editar
            </Link>
            <BotaoExcluir
              acao={apagarPratica}
              campos={{ id }}
              pergunta="Excluir esta prática? Não dá para desfazer."
              discreto
            />
          </span>
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight">{pratica.titulo}</h1>
        <p className="mt-2 text-sm text-tinta-suave">Atividade só sua, feita dos seus resumos. Pode refazer quantas vezes quiser.</p>
        <div className="mt-6">
          {pratica.exercicios.length > 0 ? (
            <AulaAtividade exercicios={pratica.exercicios} />
          ) : (
            <p className="text-tinta-suave">Esta prática está sem exercícios.</p>
          )}
        </div>
      </main>
    </>
  );
}
