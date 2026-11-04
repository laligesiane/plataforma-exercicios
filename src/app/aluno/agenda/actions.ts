"use server";

import { revalidatePath } from "next/cache";
import type { EstadoFormulario } from "@/components/ui/Mensagem";
import { hojeNoFuso } from "@/lib/aulas";
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
