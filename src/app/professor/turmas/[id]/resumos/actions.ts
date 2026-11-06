"use server";

import { obterIdioma } from "@/i18n/servidor";
import { textosDoObjeto } from "@/lib/palavroes";
import { avisoPalavrao } from "@/lib/palavroes/servidor";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { EstadoFormulario } from "@/components/ui/Mensagem";
import { validarMapa } from "@/lib/mapas";
import { normalizarTemas } from "@/lib/atividades/modelo";
import { lerConteudo, lerCorResumo, lerVisibilidadeResumo } from "@/lib/resumos";
import { exigirPapel } from "@/lib/perfil";
import { marcarEvento } from "@/lib/analytics/servidor";
import { criarClienteServidor } from "@/lib/supabase/servidor";

/** Cria (sem id) ou atualiza (com id) um resumo e volta para a turma. */
export async function salvarResumo(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  await exigirPapel("professor");

  const id = String(formData.get("id") ?? "");
  const turmaId = String(formData.get("turma_id") ?? "");
  const aulaId = String(formData.get("aula_id") ?? "") || null;
  const titulo = String(formData.get("titulo") ?? "").trim().slice(0, 200);
  const { conteudo, texto } = lerConteudo(formData.get("conteudo"));

  let mapa;
  try {
    mapa = validarMapa(JSON.parse(String(formData.get("mapa") ?? "null")));
  } catch {
    mapa = null;
  }
  if (!mapa) return { erro: "Não foi possível ler o mapa mental." };
  if (!titulo && !texto && !mapa.centro && mapa.ramos.length === 0) {
    return { erro: "Escreva um título, o resumo ou monte o mapa." };
  }
  const palavrao = await avisoPalavrao(titulo, texto, textosDoObjeto(mapa));
  if (palavrao) return { erro: palavrao };

  const supabase = await criarClienteServidor();
  const valores = {
    aula_id: aulaId,
    titulo,
    texto,
    conteudo,
    mapa,
    cor: lerCorResumo(formData.get("cor")),
    ...lerVisibilidadeResumo(formData.get("visibilidade")),
    temas: normalizarTemas(String(formData.get("temas") ?? "")),
  };
  const { error } = id
    ? await supabase
        .from("resumo")
        .update({ ...valores, atualizado_em: new Date().toISOString() })
        .eq("id", id)
    : await supabase.from("resumo").insert({ turma_id: turmaId, ...valores, idioma: await obterIdioma() });
  if (error) return { erro: "Não foi possível salvar o resumo." };
  if (!id) await marcarEvento("resumo_criado", { papel: "professor" });

  revalidatePath(`/professor/turmas/${turmaId}`);
  revalidatePath("/aluno");
  revalidatePath("/biblioteca/resumos");
  if (id) revalidatePath(`/resumos/${id}`);
  redirect(`/professor/turmas/${turmaId}?resumo=salvo`);
}

export async function apagarResumo(formData: FormData) {
  await exigirPapel("professor");
  const id = String(formData.get("id") ?? "");
  const turmaId = String(formData.get("turma_id") ?? "");
  const supabase = await criarClienteServidor();
  await supabase.from("resumo").delete().eq("id", id);
  revalidatePath(`/professor/turmas/${turmaId}`);
  revalidatePath("/aluno");
  redirect(`/professor/turmas/${turmaId}`);
}
