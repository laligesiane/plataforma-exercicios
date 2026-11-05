import Link from "next/link";
import { notFound } from "next/navigation";
import { Cabecalho } from "@/components/Cabecalho";
import { ehUuid } from "@/lib/atividades/modelo";
import { exigirPapel } from "@/lib/perfil";
import { carregarPratica } from "../../dados";
import { EditorPratica } from "../../EditorPratica";

export default async function EditarPratica({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await exigirPapel("aluno");
  if (!ehUuid(id)) notFound();
  const pratica = await carregarPratica(id);
  if (!pratica) notFound();

  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-4xl px-4 pt-8 pb-16">
        <Link href={`/aluno/praticas/${id}`} className="text-sm font-bold text-primaria hover:underline">
          ← Voltar à prática
        </Link>
        <EditorPratica pratica={{ id: pratica.id, titulo: pratica.titulo, exercicios: pratica.exercicios }} />
      </main>
    </>
  );
}
