import { notFound } from "next/navigation";
import { Cabecalho } from "@/components/Cabecalho";
import { carregarAtividade } from "@/lib/atividades/carregar";
import { ehUuid } from "@/lib/atividades/modelo";
import { exigirPapel } from "@/lib/perfil";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { EditorAtividade } from "./EditorAtividade";

export default async function PaginaEditor({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ copia?: string }>;
}) {
  const [{ id }, { copia }] = await Promise.all([params, searchParams]);
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
      <main className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        {copia && (
          <p role="status" className="mb-4 rounded-xl bg-primaria-suave px-3.5 py-2.5 text-sm">
            Esta é uma cópia em rascunho, só sua. Ajuste o que quiser, marque as turmas e publique.
          </p>
        )}
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
