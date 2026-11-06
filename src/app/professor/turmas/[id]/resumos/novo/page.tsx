import Link from "next/link";
import { notFound } from "next/navigation";
import { Cabecalho } from "@/components/Cabecalho";
import { exigirPapel } from "@/lib/perfil";
import { salvarResumo } from "../actions";
import { turmaComAulas } from "../dados";
import { EditorResumo } from "@/components/EditorResumo";

export default async function NovoResumo({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ aula?: string }>;
}) {
  const [{ id }, { aula }] = await Promise.all([params, searchParams]);
  await exigirPapel("professor");
  const { turma, aulas } = await turmaComAulas(id);
  if (!turma) notFound();

  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-7xl px-4 pt-8 pb-16 sm:px-6 lg:px-8">
        <Link href={`/professor/turmas/${turma.id}`} className="text-sm font-bold text-primaria hover:underline">
          ← {turma.nome}
        </Link>
        <h1 className="mt-3 mb-6 text-3xl font-extrabold tracking-tight">Novo resumo</h1>
        <EditorResumo salvar={salvarResumo} ocultos={{ turma_id: turma.id }} aulas={aulas} aulaInicial={aula} publicacao />
      </main>
    </>
  );
}
