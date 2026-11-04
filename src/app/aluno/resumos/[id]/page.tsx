import Link from "next/link";
import { notFound } from "next/navigation";
import { Cabecalho } from "@/components/Cabecalho";
import { VerResumo } from "@/components/VerResumo";
import { formatarData, tituloAula } from "@/lib/aulas";
import { exigirPapel } from "@/lib/perfil";
import { camposResumo, type Resumo } from "@/lib/resumos";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export default async function ResumoDoAluno({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await exigirPapel("aluno");
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("resumo")
    .select(`${camposResumo}, materia_id, turma(nome), aula(data, titulo), materia(id, nome)`)
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();

  const turma = data.turma as unknown as { nome: string } | null;
  const aula = data.aula as unknown as { data: string; titulo: string } | null;
  const materia = data.materia as unknown as { id: string; nome: string } | null;
  const subtitulo = [materia?.nome, turma?.nome, aula && (aula.titulo.trim() ? `${aula.titulo} · ${formatarData(aula.data)}` : tituloAula(aula))].filter(Boolean).join(" · ");

  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-4xl px-4 pt-8 pb-16">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <Link
            href={materia ? `/aluno/materias/${materia.id}` : "/aluno"}
            className="text-sm font-bold text-primaria hover:underline"
          >
            ← {materia ? materia.nome : "Meu painel"}
          </Link>
          {materia && (
            <Link
              href={`/aluno/materias/${materia.id}/resumos/${data.id}`}
              className="text-sm font-bold text-primaria hover:underline"
            >
              Editar
            </Link>
          )}
        </div>
        <div className="mt-3">
          <VerResumo resumo={data as unknown as Resumo} subtitulo={subtitulo} />
        </div>
      </main>
    </>
  );
}
