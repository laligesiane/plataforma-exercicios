"use server";

import { revalidatePath } from "next/cache";
import type { EstadoFormulario } from "@/components/ui/Mensagem";
import { validarItensImportados } from "@/lib/importar-calendario";
import { exigirPapel } from "@/lib/perfil";
import { criarClienteServidor } from "@/lib/supabase/servidor";

/** Salva no calendário da turma o que o professor revisou e deixou marcado. */
export async function importarDatasTurma(turmaId: string, itensJson: string): Promise<EstadoFormulario> {
  await exigirPapel("professor");
  let bruto: unknown;
  try {
    bruto = JSON.parse(itensJson);
  } catch {
    return { erro: "Não foi possível ler a lista. Tente de novo." };
  }
  const r = validarItensImportados(bruto);
  if ("erro" in r) return { erro: r.erro };

  const supabase = await criarClienteServidor();
  // O RLS já barra turma de outro professor; aqui a mensagem fica mais clara.
  const { data: turma } = await supabase.from("turma").select("id").eq("id", turmaId).maybeSingle();
  if (!turma) return { erro: "Turma não encontrada." };

  const { error } = await supabase.from("data_turma").insert(r.itens.map((i) => ({ turma_id: turmaId, ...i })));
  if (error) return { erro: "Não foi possível salvar. Nada foi salvo; tente de novo." };

  revalidatePath(`/professor/turmas/${turmaId}`);
  revalidatePath("/aluno/agenda");
  const n = r.itens.length;
  return { sucesso: `Pronto: ${n} ${n === 1 ? "data foi salva" : "datas foram salvas"}. Os alunos da turma já veem na agenda.` };
}

export async function apagarDataTurma(formData: FormData) {
  await exigirPapel("professor");
  const turmaId = String(formData.get("turma_id") ?? "");
  const supabase = await criarClienteServidor();
  await supabase.from("data_turma").delete().eq("id", String(formData.get("id") ?? ""));
  revalidatePath(`/professor/turmas/${turmaId}`);
  revalidatePath("/aluno/agenda");
}
