"use server";

import { avisoPalavrao } from "@/lib/palavroes/servidor";
import { revalidatePath } from "next/cache";
import type { EstadoFormulario } from "@/components/ui/Mensagem";
import { dataValida } from "@/lib/aulas";
import { exigirPapel } from "@/lib/perfil";
import { criarClienteServidor } from "@/lib/supabase/servidor";

function texto(formData: FormData, campo: string, max: number) {
  return String(formData.get(campo) ?? "").trim().slice(0, max);
}

/** Cria (sem id) ou atualiza (com id) uma aula da turma. */
export async function salvarAula(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  await exigirPapel("professor");

  const id = String(formData.get("id") ?? "");
  const turmaId = String(formData.get("turma_id") ?? "");
  const data = String(formData.get("data") ?? "");
  if (!dataValida(data)) return { erro: "Escolha a data da aula." };

  const valores = {
    data,
    titulo: texto(formData, "titulo", 200),
    resumo: texto(formData, "resumo", 5000),
    proximos_passos: texto(formData, "proximos_passos", 3000),
    tarefa: texto(formData, "tarefa", 3000),
  };
  if (!valores.titulo && !valores.resumo && !valores.proximos_passos && !valores.tarefa) {
    return { erro: "Escreva ao menos o que foi visto na aula." };
  }
  const palavrao = await avisoPalavrao(valores.titulo, valores.resumo, valores.proximos_passos, valores.tarefa);
  if (palavrao) return { erro: palavrao };

  const supabase = await criarClienteServidor();
  const { error } = id
    ? await supabase
        .from("aula")
        .update({ ...valores, atualizada_em: new Date().toISOString() })
        .eq("id", id)
    : await supabase.from("aula").insert({ turma_id: turmaId, ...valores });
  if (error) return { erro: "Não foi possível salvar a aula." };

  revalidatePath(`/professor/turmas/${turmaId}`);
  revalidatePath("/aluno");
  return { sucesso: id ? "Aula atualizada." : "Aula registrada. Os alunos já podem ver o resumo." };
}

export async function apagarAula(formData: FormData) {
  await exigirPapel("professor");
  const id = String(formData.get("id") ?? "");
  const turmaId = String(formData.get("turma_id") ?? "");
  const supabase = await criarClienteServidor();
  await supabase.from("aula").delete().eq("id", id);
  revalidatePath(`/professor/turmas/${turmaId}`);
  revalidatePath("/aluno");
}
