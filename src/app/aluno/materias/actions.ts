"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { EstadoFormulario } from "@/components/ui/Mensagem";
import { mensagemDeLimite } from "@/lib/limites";
import { ordemCores, validarMapa, type Cor } from "@/lib/mapas";
import { exigirPapel } from "@/lib/perfil";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export async function criarMateria(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  await exigirPapel("aluno");
  const nome = String(formData.get("nome") ?? "").trim().slice(0, 80);
  const cor = String(formData.get("cor") ?? "menta");
  if (!nome) return { erro: "Dê um nome para a matéria." };

  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from("materia")
    .insert({ nome, cor: ordemCores.includes(cor as Cor) ? cor : "menta" })
    .select("id")
    .single();
  if (error) return { erro: mensagemDeLimite(error.message) ?? "Não foi possível criar a matéria." };

  revalidatePath("/aluno");
  redirect(`/aluno/materias/${data.id}`);
}

export async function apagarMateria(formData: FormData) {
  await exigirPapel("aluno");
  const supabase = await criarClienteServidor();
  await supabase.from("materia").delete().eq("id", String(formData.get("id") ?? ""));
  revalidatePath("/aluno");
  redirect("/aluno");
}

/** Cria (sem id) ou atualiza (com id) um resumo pessoal do aluno. */
export async function salvarResumoAluno(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  await exigirPapel("aluno");

  const id = String(formData.get("id") ?? "");
  const materiaId = String(formData.get("materia_id") ?? "");
  const titulo = String(formData.get("titulo") ?? "").trim().slice(0, 200);
  const texto = String(formData.get("texto") ?? "").trim().slice(0, 10000);
  let mapa;
  try {
    mapa = validarMapa(JSON.parse(String(formData.get("mapa") ?? "null")));
  } catch {
    mapa = null;
  }
  if (!mapa) return { erro: "Não foi possível ler o mapa mental." };
  if (!titulo && !texto && !mapa.centro && mapa.ramos.length === 0) {
    return { erro: "Escreva um título, um texto ou monte o mapa." };
  }

  const supabase = await criarClienteServidor();
  const valores = { titulo, texto, mapa };
  const { error } = id
    ? await supabase
        .from("resumo")
        .update({ ...valores, atualizado_em: new Date().toISOString() })
        .eq("id", id)
    : await supabase.from("resumo").insert({ materia_id: materiaId, ...valores });
  if (error) return { erro: "Não foi possível salvar o resumo." };

  revalidatePath(`/aluno/materias/${materiaId}`);
  redirect(`/aluno/materias/${materiaId}`);
}

export async function apagarResumoAluno(formData: FormData) {
  await exigirPapel("aluno");
  const materiaId = String(formData.get("materia_id") ?? "");
  const supabase = await criarClienteServidor();
  await supabase.from("resumo").delete().eq("id", String(formData.get("id") ?? ""));
  revalidatePath(`/aluno/materias/${materiaId}`);
  redirect(`/aluno/materias/${materiaId}`);
}
