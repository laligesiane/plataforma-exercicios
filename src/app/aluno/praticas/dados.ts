import { ehExercicio, type Exercicio } from "@/lib/atividades/modelo";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export type Pratica = {
  id: string;
  titulo: string;
  resumo_id: string | null;
  exercicios: Exercicio[];
  criada_em: string;
};

/** Uma prática do aluno logado (o RLS só deixa ver as dele). Exercícios com forma estranha ficam de fora. */
export async function carregarPratica(id: string): Promise<Pratica | null> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.from("pratica").select("id, titulo, resumo_id, exercicios, criada_em").eq("id", id).maybeSingle();
  if (!data) return null;
  const exercicios = (Array.isArray(data.exercicios) ? data.exercicios : []).filter(ehExercicio) as Exercicio[];
  return { ...(data as Omit<Pratica, "exercicios">), exercicios };
}

export function contarItens(exercicios: unknown): number {
  return Array.isArray(exercicios)
    ? exercicios.reduce((soma: number, e) => soma + (Array.isArray((e as { itens?: unknown[] })?.itens) ? (e as { itens: unknown[] }).itens.length : 0), 0)
    : 0;
}
