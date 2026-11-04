import Link from "next/link";
import { notFound } from "next/navigation";
import { Cabecalho } from "@/components/Cabecalho";
import { BotaoExcluir } from "@/components/BotaoExcluir";
import { ExportarPdf } from "@/components/ExportarPdf";
import { VerResumo } from "@/components/VerResumo";
import { documentoTemConteudo } from "@/lib/documento";
import { validarMapa } from "@/lib/mapas";
import { apagarResumoAluno } from "@/app/aluno/materias/actions";
import { formatarData, tituloAula } from "@/lib/aulas";
import { exigirPapel } from "@/lib/perfil";
import { camposResumo, documentoDoResumo, type Resumo } from "@/lib/resumos";
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

  const temTexto = documentoTemConteudo(documentoDoResumo(data as unknown as Resumo));
  const mapa = validarMapa(data.mapa);
  const temMapa = !!mapa && (!!mapa.centro || mapa.ramos.length > 0);

  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-5xl px-4 pt-8 pb-16">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <Link
            href={materia ? `/aluno/materias/${materia.id}` : "/aluno/resumos"}
            className="text-sm font-bold text-primaria hover:underline"
          >
            ← {materia ? materia.nome : "Meus resumos"}
          </Link>
          <span className="flex items-baseline gap-4">
            <ExportarPdf id={data.id} temTexto={temTexto} temMapa={temMapa} />
            {materia && (
              <>
              <Link
                href={`/aluno/materias/${materia.id}/resumos/${data.id}`}
                className="text-sm font-bold text-primaria hover:underline"
              >
                Editar
              </Link>
              <BotaoExcluir
                acao={apagarResumoAluno}
                campos={{ id: data.id, materia_id: materia.id }}
                pergunta="Excluir este resumo e o mapa mental dele? Não dá para desfazer."
                discreto
              />
              </>
            )}
          </span>
        </div>
        <div className="mt-3">
          <VerResumo resumo={data as unknown as Resumo} subtitulo={subtitulo} />
        </div>
      </main>
    </>
  );
}
