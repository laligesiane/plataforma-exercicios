"use server";

import { hojeNoFuso } from "@/lib/aulas";
import { avancar, type Andamento } from "@/lib/revisao";
import { criarClienteServidor } from "@/lib/supabase/servidor";

/** Registra a primeira resposta de hoje a um item da revisão e devolve quando ele volta. */
export async function responderRevisao(id: number, acertou: boolean): Promise<Andamento | null> {
  if (!Number.isSafeInteger(id) || typeof acertou !== "boolean") return null;

  const supabase = await criarClienteServidor();
  const { data: linha } = await supabase.from("revisao").select("etapa").eq("id", id).maybeSingle();
  if (!linha) return null;

  const andamento = avancar(linha.etapa, acertou, hojeNoFuso());
  const { error } = await supabase
    .from("revisao")
    .update({
      etapa: andamento.etapa,
      proxima_em: andamento.proximaEm,
      concluida_em: andamento.concluida ? new Date().toISOString() : null,
      atualizada_em: new Date().toISOString(),
    })
    .eq("id", id);
  return error ? null : andamento;
}
