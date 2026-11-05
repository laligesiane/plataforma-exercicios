"use server";

import { revalidatePath } from "next/cache";
import { ehUuid } from "@/lib/atividades/modelo";
import { exigirPapel } from "@/lib/perfil";
import { criarClienteServidor } from "@/lib/supabase/servidor";

/** Gera um código novo para a turma; o RLS só deixa o professor dono alterar. */
export async function trocarCodigoTurma(formData: FormData) {
  await exigirPapel("professor");
  const turmaId = String(formData.get("turma_id") ?? "");
  if (!ehUuid(turmaId)) return;
  const supabase = await criarClienteServidor();
  const { data: codigo } = await supabase.rpc("novo_codigo_turma");
  if (typeof codigo !== "string") return;
  await supabase.from("turma").update({ codigo }).eq("id", turmaId);
  revalidatePath(`/professor/turmas/${turmaId}`);
}
