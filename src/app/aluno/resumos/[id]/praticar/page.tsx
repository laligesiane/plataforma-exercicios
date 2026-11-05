import Link from "next/link";
import { notFound } from "next/navigation";
import { Cabecalho } from "@/components/Cabecalho";
import { ehUuid } from "@/lib/atividades/modelo";
import { iaConfigurada } from "@/lib/pratica/gerar";
import { exigirPapel } from "@/lib/perfil";
import { tituloResumo, type Resumo } from "@/lib/resumos";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { EditorPratica } from "@/app/aluno/praticas/EditorPratica";

// A geração com IA pode levar perto de um minuto.
export const maxDuration = 120;

export default async function GerarPratica({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await exigirPapel("aluno");
  if (!ehUuid(id)) notFound();
  const supabase = await criarClienteServidor();
  const { data } = await supabase.from("resumo").select("id, titulo, mapa").eq("id", id).maybeSingle();
  if (!data) notFound();
  const titulo = tituloResumo(data as unknown as Resumo);

  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-4xl px-4 pt-8 pb-16">
        <Link href={`/aluno/resumos/${id}`} className="text-sm font-bold text-primaria hover:underline">
          ← Voltar ao resumo
        </Link>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight">Gerar atividade</h1>
        <p className="mt-2 mb-6 text-tinta-suave">
          Exercícios para treinar sozinho, feitos a partir do seu resumo. Sem nota: errou, você vê a explicação e tenta de novo.
        </p>
        {iaConfigurada() ? (
          <EditorPratica resumo={{ id, titulo }} />
        ) : (
          <p className="rounded-2xl border border-dashed border-linha p-6 text-center text-tinta-suave">
            A geração com IA ainda não está ligada no Repasa. Volte em breve!
          </p>
        )}
      </main>
    </>
  );
}
