"use server";

import { ehUuid } from "@/lib/atividades/modelo";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const status = new Set(["certo", "certo_com_aviso", "errado"]);

export type NovaResposta = {
  atividadeId: string;
  exercicioId: string;
  itemId: string;
  valor: string;
  status: string;
};

/** Grava a resposta de um aluno da turma. O RLS recusa quem não é aluno da atividade. */
export async function registrarResposta(r: NovaResposta): Promise<boolean> {
  if (!ehUuid(r.atividadeId) || !ehUuid(r.exercicioId) || !status.has(r.status)) return false;
  if (typeof r.itemId !== "string" || typeof r.valor !== "string") return false;

  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("resposta").insert({
    atividade_id: r.atividadeId,
    exercicio_id: r.exercicioId,
    item_id: r.itemId.slice(0, 64),
    valor: r.valor.slice(0, 500),
    status: r.status,
  });
  return !error;
}
