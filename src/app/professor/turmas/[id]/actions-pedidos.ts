"use server";

import { revalidatePath } from "next/cache";
import { exigirPapel } from "@/lib/perfil";
import { criarClienteServidor } from "@/lib/supabase/servidor";

function atualizar(turmaId: string) {
  revalidatePath(`/professor/turmas/${turmaId}`);
  revalidatePath("/professor");
}

/** Aceita o pedido: cria a aula no dia pedido e liga o pedido a ela. */
export async function aceitarPedido(formData: FormData) {
  await exigirPapel("professor");
  const id = String(formData.get("id") ?? "");
  const supabase = await criarClienteServidor();

  const { data: pedido } = await supabase
    .from("pedido_aula")
    .select("id, turma_id, data, hora, mensagem, status, perfil(nome, email)")
    .eq("id", id)
    .maybeSingle();
  if (!pedido || pedido.status !== "pendente") return;

  const aluno = pedido.perfil as unknown as { nome: string | null; email: string } | null;
  const quem = aluno?.nome || aluno?.email || "aluno";
  const { data: aula, error } = await supabase
    .from("aula")
    .insert({
      turma_id: pedido.turma_id,
      data: pedido.data,
      titulo: `Aula pedida por ${quem}${pedido.hora ? ` às ${String(pedido.hora).slice(0, 5)}` : ""}`.slice(0, 200),
      proximos_passos: pedido.mensagem,
    })
    .select("id")
    .single();
  if (error) return;

  await supabase
    .from("pedido_aula")
    .update({ status: "aceito", aula_id: aula.id, respondido_em: new Date().toISOString() })
    .eq("id", id);
  atualizar(pedido.turma_id);
}

export async function recusarPedido(formData: FormData) {
  await exigirPapel("professor");
  const id = String(formData.get("id") ?? "");
  const turmaId = String(formData.get("turma_id") ?? "");
  const supabase = await criarClienteServidor();
  await supabase
    .from("pedido_aula")
    .update({ status: "recusado", respondido_em: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "pendente");
  atualizar(turmaId);
}
