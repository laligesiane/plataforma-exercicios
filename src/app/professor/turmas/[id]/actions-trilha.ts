"use server";

import { revalidatePath } from "next/cache";
import { ehUuid } from "@/lib/atividades/modelo";
import { exigirPapel } from "@/lib/perfil";
import { criarClienteServidor } from "@/lib/supabase/servidor";

/** Liga ou desliga a trilha da turma (próxima atividade só abre depois da anterior). */
export async function alternarTrilha(formData: FormData) {
  await exigirPapel("professor");
  const turmaId = String(formData.get("turma_id") ?? "");
  if (!ehUuid(turmaId)) return;
  const supabase = await criarClienteServidor();
  await supabase.from("turma").update({ trilha: formData.get("trilha") === "on" }).eq("id", turmaId);
  revalidatePath(`/professor/turmas/${turmaId}`);
}

/** Sobe ou desce a atividade na ordem da turma, trocando de lugar com a vizinha. */
export async function moverNaTrilha(formData: FormData) {
  await exigirPapel("professor");
  const turmaId = String(formData.get("turma_id") ?? "");
  const atividadeId = String(formData.get("atividade_id") ?? "");
  const direcao = formData.get("direcao") === "subir" ? -1 : 1;
  if (!ehUuid(turmaId) || !ehUuid(atividadeId)) return;

  const supabase = await criarClienteServidor();
  const { data } = await supabase.from("atividade_turma").select("atividade_id, ordem").eq("turma_id", turmaId).order("ordem").order("atividade_id");
  const lista = data ?? [];
  const i = lista.findIndex((l) => l.atividade_id === atividadeId);
  const j = i + direcao;
  if (i < 0 || j < 0 || j >= lista.length) return;

  // Renumera tudo em sequência, já com a troca, para não depender de ordens repetidas.
  const nova = [...lista];
  [nova[i], nova[j]] = [nova[j], nova[i]];
  await Promise.all(
    nova.map((l, n) =>
      l.ordem === n + 1
        ? null
        : supabase.from("atividade_turma").update({ ordem: n + 1 }).eq("turma_id", turmaId).eq("atividade_id", l.atividade_id),
    ),
  );
  revalidatePath(`/professor/turmas/${turmaId}`);
}
