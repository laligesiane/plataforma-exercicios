import Link from "next/link";
import { notFound } from "next/navigation";
import { Cabecalho } from "@/components/Cabecalho";
import { EditorResumo } from "@/components/EditorResumo";
import { exigirPapel } from "@/lib/perfil";
import { iaConfigurada } from "@/lib/pratica/gerar";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { salvarResumoAluno } from "../../../actions";

/** Gerar o resumo com IA pode levar até um minuto. */
export const maxDuration = 120;

export default async function NovoResumoAluno({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await exigirPapel("aluno");
  const supabase = await criarClienteServidor();
  const { data: materia } = await supabase.from("materia").select("id, nome").eq("id", id).maybeSingle();
  if (!materia) notFound();

  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-7xl px-4 pt-8 pb-16 sm:px-6 lg:px-8">
        <Link href={`/aluno/materias/${materia.id}`} className="text-sm font-bold text-primaria hover:underline">
          ← {materia.nome}
        </Link>
        <h1 className="mt-3 mb-6 text-3xl font-extrabold tracking-tight">Novo resumo</h1>
        <EditorResumo salvar={salvarResumoAluno} ocultos={{ materia_id: materia.id }} comIa={iaConfigurada()} />
      </main>
    </>
  );
}
