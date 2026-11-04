import "server-only";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import type { Atividade, Exercicio } from "./modelo";

const camposAtividade = "id, titulo, nivel, categoria, idioma_ensinado, idioma_instrucao, explicacao, publicada, publica, professor_id";

export type AtividadeCarregada = Atividade & { professor_id: string };

/** Atividade com exercícios em ordem, se quem está logado (ou o público) pode vê-la. */
export async function carregarAtividade(id: string) {
  const supabase = await criarClienteServidor();
  const [{ data: atividade }, { data: linhas }] = await Promise.all([
    supabase.from("atividade").select(camposAtividade).eq("id", id).maybeSingle(),
    supabase.from("exercicio").select("id, tipo, titulo, instrucoes, itens").eq("atividade_id", id).order("ordem"),
  ]);
  if (!atividade) return null;
  return {
    atividade: atividade as AtividadeCarregada,
    exercicios: (linhas ?? []) as Exercicio[],
  };
}
