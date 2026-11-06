import Link from "next/link";
import { notFound } from "next/navigation";
import { Cabecalho } from "@/components/Cabecalho";
import { BotaoExcluir } from "@/components/BotaoExcluir";
import { validarMapa } from "@/lib/mapas";
import { exigirPapel } from "@/lib/perfil";
import { camposResumo, documentoDoResumo, type Resumo } from "@/lib/resumos";
import { documentoTemConteudo } from "@/lib/documento";
import { ExportarPdf } from "@/components/ExportarPdf";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { apagarResumo, salvarResumo } from "../actions";
import { turmaComAulas } from "../dados";
import { EditorResumo } from "@/components/EditorResumo";

export default async function EditarResumo({ params }: { params: Promise<{ id: string; resumoId: string }> }) {
  const { id, resumoId } = await params;
  await exigirPapel("professor");
  const supabase = await criarClienteServidor();
  const [{ turma, aulas }, { data }] = await Promise.all([
    turmaComAulas(id),
    supabase.from("resumo").select(camposResumo).eq("id", resumoId).eq("turma_id", id).maybeSingle(),
  ]);
  if (!turma || !data) notFound();
  const resumo = { ...data, mapa: validarMapa(data.mapa) ?? { centro: "", ramos: [] } } as Resumo;

  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-7xl px-4 pt-8 pb-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <Link href={`/professor/turmas/${turma.id}`} className="text-sm font-bold text-primaria hover:underline">
            ← {turma.nome}
          </Link>
          <ExportarPdf
            id={resumo.id}
            temTexto={documentoTemConteudo(documentoDoResumo(resumo))}
            temMapa={!!(resumo.mapa.centro || resumo.mapa.ramos.length)}
          />
        </div>
        <h1 className="mt-3 mb-6 text-3xl font-extrabold tracking-tight">Editar resumo</h1>
        <EditorResumo salvar={salvarResumo} ocultos={{ turma_id: turma.id }} aulas={aulas} resumo={resumo} publicacao />
        <BotaoExcluir
          acao={apagarResumo}
          campos={{ id: resumo.id, turma_id: turma.id }}
          rotulo="Excluir resumo"
          pergunta="Excluir este resumo e o mapa mental dele? Os alunos deixam de vê-lo. Não dá para desfazer."
          className="mt-8 border-t border-linha pt-6"
        />
      </main>
    </>
  );
}
