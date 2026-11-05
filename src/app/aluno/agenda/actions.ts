"use server";

import { revalidatePath } from "next/cache";
import type { EstadoFormulario } from "@/components/ui/Mensagem";
import { hojeNoFuso } from "@/lib/aulas";
import { validarCompromisso } from "@/lib/compromissos";
import { validarPedido } from "@/lib/pedidos";
import { exigirPapel } from "@/lib/perfil";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export async function pedirAula(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const perfil = await exigirPapel("aluno");
  const supabase = await criarClienteServidor();
  const { data: turmas } = await supabase.from("turma_aluno").select("turma_id").eq("aluno_id", perfil.id);

  const campo = (nome: string) => String(formData.get(nome) ?? "");
  const r = validarPedido(
    { turma_id: campo("turma_id"), data: campo("data"), hora: campo("hora"), mensagem: campo("mensagem") },
    (turmas ?? []).map((t) => t.turma_id),
    hojeNoFuso(),
  );
  if ("erro" in r) return { erro: r.erro };

  const { error } = await supabase.from("pedido_aula").insert({
    turma_id: r.pedido.turmaId,
    data: r.pedido.data,
    hora: r.pedido.hora,
    mensagem: r.pedido.mensagem,
  });
  if (error) return { erro: "Não foi possível enviar o pedido." };

  revalidatePath("/aluno/agenda");
  revalidatePath("/aluno");
  return { sucesso: "Pedido enviado. Quando o professor responder, aparece aqui." };
}

export async function cancelarPedido(formData: FormData) {
  await exigirPapel("aluno");
  const supabase = await criarClienteServidor();
  await supabase.from("pedido_aula").delete().eq("id", String(formData.get("id") ?? ""));
  revalidatePath("/aluno/agenda");
  revalidatePath("/aluno");
}

function camposDe(formData: FormData) {
  return Object.fromEntries(
    ["tipo", "titulo", "materia", "data", "hora", "feito", "nota", "anotacao"].map((n) => [n, String(formData.get(n) ?? "")]),
  );
}

/** Cria ou edita um compromisso da agenda pessoal (com `id`, edita). */
export async function salvarCompromisso(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  await exigirPapel("aluno");
  const r = validarCompromisso(camposDe(formData));
  if ("erro" in r) return { erro: r.erro };

  const supabase = await criarClienteServidor();
  const id = String(formData.get("id") ?? "");
  const { error } = id
    ? await supabase.from("compromisso").update(r.compromisso).eq("id", id)
    : await supabase.from("compromisso").insert(r.compromisso);
  if (error) return { erro: "Não foi possível salvar." };

  revalidatePath("/aluno/agenda");
  revalidatePath("/aluno");
  return { sucesso: id ? "Salvo." : "Adicionado à sua agenda." };
}

export async function marcarCompromisso(formData: FormData) {
  await exigirPapel("aluno");
  const supabase = await criarClienteServidor();
  await supabase
    .from("compromisso")
    .update({ feito: formData.get("feito") === "true" })
    .eq("id", String(formData.get("id") ?? ""));
  revalidatePath("/aluno/agenda");
  revalidatePath("/aluno");
}

export async function excluirCompromisso(formData: FormData) {
  await exigirPapel("aluno");
  const supabase = await criarClienteServidor();
  await supabase.from("compromisso").delete().eq("id", String(formData.get("id") ?? ""));
  revalidatePath("/aluno/agenda");
  revalidatePath("/aluno");
}
