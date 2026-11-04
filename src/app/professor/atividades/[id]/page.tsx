import { notFound } from "next/navigation";
import { Cabecalho } from "@/components/Cabecalho";
import { carregarAtividade } from "@/lib/atividades/carregar";
import { ehUuid } from "@/lib/atividades/modelo";
import { exigirPapel } from "@/lib/perfil";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { EditorAtividade } from "./EditorAtividade";

export default async function PaginaEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const professor = await exigirPapel("professor");
  if (!ehUuid(id)) notFound();

  const supabase = await criarClienteServidor();
  const [carregada, { data: turmas }, { data: atribuidas }] = await Promise.all([
    carregarAtividade(id),
    supabase.from("turma").select("id, nome").order("criada_em"),
    supabase.from("atividade_turma").select("turma_id").eq("atividade_id", id),
  ]);
  if (!carregada || carregada.atividade.professor_id !== professor.id) notFound();

  const { atividade } = carregada;

  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-3xl px-4 pt-6">
        <EditorAtividade
          inicial={atividade}
          exerciciosIniciais={carregada.exercicios}
          turmas={turmas ?? []}
          turmasIniciais={(atribuidas ?? []).map((t) => t.turma_id as string)}
        />
      </main>
    </>
  );
}
