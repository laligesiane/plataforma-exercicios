import "server-only";
import { formatarData, tituloAula } from "@/lib/aulas";
import { criarClienteServidor } from "@/lib/supabase/servidor";

/** Turma e as aulas dela, para o seletor de aula do editor. */
export async function turmaComAulas(turmaId: string) {
  const supabase = await criarClienteServidor();
  const [{ data: turma }, { data: aulas }] = await Promise.all([
    supabase.from("turma").select("id, nome").eq("id", turmaId).maybeSingle(),
    supabase.from("aula").select("id, data, titulo").eq("turma_id", turmaId).order("data", { ascending: false }),
  ]);
  const opcoes = (aulas ?? []).map((a) => ({
    id: a.id as string,
    rotulo: a.titulo?.trim() ? `${formatarData(a.data)} · ${a.titulo}` : tituloAula(a),
  }));
  return { turma, aulas: opcoes };
}
