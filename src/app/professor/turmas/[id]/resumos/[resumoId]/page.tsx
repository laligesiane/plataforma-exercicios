import Link from "next/link";
import { notFound } from "next/navigation";
import { Cabecalho } from "@/components/Cabecalho";
import { botaoSecundario } from "@/components/ui/estilos";
import { validarMapa } from "@/lib/mapas";
import { exigirPapel } from "@/lib/perfil";
import { camposResumo, type Resumo } from "@/lib/resumos";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { apagarResumo } from "../actions";
import { turmaComAulas } from "../dados";
import { EditorResumo } from "../EditorResumo";

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
      <main className="mx-auto w-full max-w-4xl px-4 pt-8 pb-16">
        <Link href={`/professor/turmas/${turma.id}`} className="text-sm font-bold text-primaria hover:underline">
          ← {turma.nome}
        </Link>
        <h1 className="mt-3 mb-6 text-3xl font-extrabold tracking-tight">Editar resumo</h1>
        <EditorResumo turmaId={turma.id} aulas={aulas} resumo={resumo} />
        <form action={apagarResumo} className="mt-8 border-t border-linha pt-6">
          <input type="hidden" name="id" value={resumo.id} />
          <input type="hidden" name="turma_id" value={turma.id} />
          <button type="submit" className={botaoSecundario}>
            Apagar resumo
          </button>
        </form>
      </main>
    </>
  );
}
