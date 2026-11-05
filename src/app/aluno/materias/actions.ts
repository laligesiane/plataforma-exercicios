"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { EstadoFormulario } from "@/components/ui/Mensagem";
import { mensagemDeLimite } from "@/lib/limites";
import { ordemCores, validarMapa, type Cor } from "@/lib/mapas";
import { exigirPapel } from "@/lib/perfil";
import { validarDocumento } from "@/lib/documento";
import { mapaDoDocumento } from "@/lib/documento/mapa";
import { camposResumo, documentoDoResumo, lerConteudo, type Resumo, lerCorResumo } from "@/lib/resumos";
import { marcarEvento } from "@/lib/analytics/servidor";
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

  const supabase = await criarClienteServidor();
  const valores = { titulo, texto, conteudo, mapa, cor: lerCorResumo(formData.get("cor")) };
  const { error } = id
    ? await supabase
        .from("resumo")
        .update({ ...valores, atualizado_em: new Date().toISOString() })
        .eq("id", id)
    : await supabase.from("resumo").insert({ materia_id: materiaId, ...valores });
  if (error) return { erro: "Não foi possível salvar o resumo." };
  if (!id) await marcarEvento("resumo_criado", { papel: "aluno" });

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

/** Gera o mapa mental a partir do texto do resumo, sem abrir o editor. Troca o mapa que já existir. */
export async function gerarMapaDoResumo(id: string): Promise<{ erro: string } | void> {
  await exigirPapel("aluno");
  const supabase = await criarClienteServidor();
  const { data } = await supabase.from("resumo").select(`${camposResumo}, materia_id`).eq("id", id).maybeSingle();
  if (!data?.materia_id) return { erro: "Não encontramos este resumo." };

  const resumo = data as unknown as Resumo;
  const doc = validarDocumento(documentoDoResumo(resumo));
  const mapa = doc ? mapaDoDocumento(doc, resumo.titulo) : null;
  if (!mapa || mapa.ramos.length === 0) return { erro: "Use títulos, subtítulos ou listas no resumo para gerar o mapa." };

  const { error } = await supabase.from("resumo").update({ mapa, atualizado_em: new Date().toISOString() }).eq("id", id);
  if (error) return { erro: "Não foi possível salvar o mapa." };
  revalidatePath(`/aluno/resumos/${id}`);
}
