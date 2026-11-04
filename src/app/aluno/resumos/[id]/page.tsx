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
    .select(`${camposResumo}, turma(nome), aula(data, titulo)`)
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();

  const turma = data.turma as unknown as { nome: string } | null;
  const aula = data.aula as unknown as { data: string; titulo: string } | null;
  const subtitulo = [turma?.nome, aula && (aula.titulo.trim() ? `${aula.titulo} · ${formatarData(aula.data)}` : tituloAula(aula))].filter(Boolean).join(" · ");

  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-4xl px-4 pt-8 pb-16">
        <Link href="/aluno" className="text-sm font-bold text-primaria hover:underline">
          ← Minhas turmas
        </Link>
        <div className="mt-3">
          <VerResumo resumo={data as unknown as Resumo} subtitulo={subtitulo} />
        </div>
      </main>
    </>
  );
}
