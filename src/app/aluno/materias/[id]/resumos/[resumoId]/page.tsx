import { obterDicionario } from "@/i18n/servidor";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Cabecalho } from "@/components/Cabecalho";
import { EditorResumo } from "@/components/EditorResumo";
import { BotaoExcluir } from "@/components/BotaoExcluir";
import { validarMapa } from "@/lib/mapas";
import { exigirPapel } from "@/lib/perfil";
import { camposResumo, type Resumo } from "@/lib/resumos";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { apagarResumoAluno, salvarResumoAluno } from "../../../actions";

export default async function EditarResumoAluno({ params }: { params: Promise<{ id: string; resumoId: string }> }) {
  const { id, resumoId } = await params;
  await exigirPapel("aluno");
  const tx = (await obterDicionario()).resumo;
  const supabase = await criarClienteServidor();
  const [{ data: materia }, { data }] = await Promise.all([
    supabase.from("materia").select("id, nome").eq("id", id).maybeSingle(),
    supabase.from("resumo").select(camposResumo).eq("id", resumoId).eq("materia_id", id).maybeSingle(),
  ]);
  if (!materia || !data) notFound();
  const resumo = { ...data, mapa: validarMapa(data.mapa) ?? { centro: "", ramos: [] } } as Resumo;

  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-7xl px-4 pt-8 pb-16 sm:px-6 lg:px-8">
        <Link href={`/aluno/resumos/${resumo.id}`} className="text-sm font-bold text-primaria hover:underline">
          ← {tx.voltarResumo}
        </Link>
        <h1 className="mt-3 mb-6 text-3xl font-extrabold tracking-tight">{tx.editarResumo}</h1>
        <EditorResumo salvar={salvarResumoAluno} ocultos={{ materia_id: materia.id }} resumo={resumo} />
        <BotaoExcluir
          acao={apagarResumoAluno}
          campos={{ id: resumo.id, materia_id: materia.id }}
          rotulo={tx.excluirResumo}
          pergunta={tx.excluirResumoPergunta}
          className="mt-8 border-t border-linha pt-6"
        />
      </main>
    </>
  );
}
