import "server-only";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import type { CursoCompleto } from "../materias/FormularioCurso";

export type MateriaDoCurso = { id: string; nome: string; cor: string; curso_id: string | null; resumos: number };
export type CursoComMaterias = CursoCompleto & { materias: MateriaDoCurso[]; resumos: number };

/** O id de mentira usado para as matérias que ainda não estão em nenhum curso. */
export const SEM_CURSO = "sem-curso";

/** Cursos do aluno com as matérias de cada um, mais as matérias sem curso. */
export async function carregarCursos() {
  const supabase = await criarClienteServidor();
  const [{ data: materiasDb }, { data: cursosDb }] = await Promise.all([
    supabase.from("materia").select("id, nome, cor, curso_id, resumo(count)").order("criada_em"),
    supabase.from("curso").select("id, nome, inicio, duracao_meses, etapa").order("nome"),
  ]);
  const materias: MateriaDoCurso[] = (materiasDb ?? []).map((m) => ({
    id: m.id,
    nome: m.nome,
    cor: m.cor,
    curso_id: m.curso_id,
    resumos: (m.resumo as unknown as { count: number }[] | null)?.[0]?.count ?? 0,
  }));
  const ids = new Set((cursosDb ?? []).map((c) => c.id as string));
  const somar = (lista: MateriaDoCurso[]) => lista.reduce((t, m) => t + m.resumos, 0);
  const cursos: CursoComMaterias[] = ((cursosDb ?? []) as CursoCompleto[]).map((c) => {
    const doCurso = materias.filter((m) => m.curso_id === c.id);
    return { ...c, materias: doCurso, resumos: somar(doCurso) };
  });
  const semCurso = materias.filter((m) => !m.curso_id || !ids.has(m.curso_id));
  return { cursos, semCurso, resumosSemCurso: somar(semCurso), totalMaterias: materias.length };
}
