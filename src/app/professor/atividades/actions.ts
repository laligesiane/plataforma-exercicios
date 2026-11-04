"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  categorias,
  configDoExercicio,
  ehExercicio,
  ehUuid,
  limparExercicio,
  niveis,
  problemasDaAtividade,
  type Atividade,
  type Exercicio,
} from "@/lib/atividades/modelo";
import { ehIdioma } from "@/lib/idiomas";
import { exigirPapel } from "@/lib/perfil";
import { criarClienteServidor } from "@/lib/supabase/servidor";

/** Cria um rascunho e abre o editor. Usa os idiomas da primeira turma, se houver. */
export async function criarAtividade() {
  const professor = await exigirPapel("professor");
  const supabase = await criarClienteServidor();

  const { data: turma } = await supabase
    .from("turma")
    .select("idioma_ensinado, idioma_instrucao")
    .order("criada_em")
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabase
    .from("atividade")
    .insert({
      professor_id: professor.id,
      idioma_ensinado: turma?.idioma_ensinado ?? "es",
      idioma_instrucao: turma?.idioma_instrucao ?? "pt",
    })
    .select("id")
    .single();

  if (error) throw new Error("Não foi possível criar a atividade.");
  redirect(`/professor/atividades/${data.id}`);
}

export type DadosAtividade = {
  atividade: Atividade;
  exercicios: Exercicio[];
  turmas: string[];
};

export type ResultadoSalvar = { ok: true } | { ok: false; erro: string; problemas?: string[] };

export async function salvarAtividade(dados: DadosAtividade): Promise<ResultadoSalvar> {
  await exigirPapel("professor");
  const { atividade } = dados;

  if (!niveis.includes(atividade.nivel)) return { ok: false, erro: "Nível inválido." };
  if (!(atividade.categoria in categorias)) return { ok: false, erro: "Categoria inválida." };
  if (!ehIdioma(atividade.idioma_ensinado) || !ehIdioma(atividade.idioma_instrucao)) {
    return { ok: false, erro: "Escolha os dois idiomas." };
  }
  if (!ehUuid(atividade.id) || !Array.isArray(dados.turmas) || !dados.turmas.every(ehUuid)) {
    return { ok: false, erro: "Dados inválidos. Recarregue a página." };
  }
  if (!Array.isArray(dados.exercicios) || !dados.exercicios.every(ehExercicio)) {
    return { ok: false, erro: "Os exercícios vieram num formato inesperado. Recarregue a página." };
  }

  const exercicios = dados.exercicios.map(limparExercicio);
  const titulo = atividade.titulo.trim();

  if (atividade.publicada) {
    const problemas = problemasDaAtividade(titulo, exercicios);
    if (problemas.length > 0) {
      return { ok: false, erro: "Falta pouco para publicar. Corrija os pontos abaixo ou salve como rascunho.", problemas };
    }
  }

  const supabase = await criarClienteServidor();

  // O RLS garante que só o dono altera; se nada voltar, a atividade não é dele.
  const { data: salva, error } = await supabase
    .from("atividade")
    .update({
      titulo: titulo || "Atividade sem título",
      nivel: atividade.nivel,
      categoria: atividade.categoria,
      idioma_ensinado: atividade.idioma_ensinado,
      idioma_instrucao: atividade.idioma_instrucao,
      explicacao: atividade.explicacao.trim(),
      publicada: atividade.publicada,
      publica: atividade.publica,
    })
    .eq("id", atividade.id)
    .select("id")
    .maybeSingle();
  if (error || !salva) return { ok: false, erro: "Não foi possível salvar a atividade." };

  // Exercícios: grava os atuais e apaga os que saíram.
  const linhas = exercicios.map((e, ordem) => ({
    id: e.id,
    atividade_id: atividade.id,
    ordem,
    tipo: e.tipo,
    titulo: e.titulo,
    instrucoes: e.instrucoes,
    itens: e.itens,
    config: configDoExercicio(e),
  }));
  if (linhas.length > 0) {
    const { error: erroExercicios } = await supabase.from("exercicio").upsert(linhas);
    if (erroExercicios) return { ok: false, erro: "Não foi possível salvar os exercícios." };
  }

  const ids = exercicios.map((e) => e.id);
  let apagar = supabase.from("exercicio").delete().eq("atividade_id", atividade.id);
  if (ids.length > 0) apagar = apagar.not("id", "in", `(${ids.join(",")})`);
  const { error: erroApagar } = await apagar;
  if (erroApagar) return { ok: false, erro: "Não foi possível remover exercícios apagados." };

  // Turmas: liga as marcadas e desliga as outras.
  const { data: atuais } = await supabase.from("atividade_turma").select("turma_id").eq("atividade_id", atividade.id);
  const ligadas = new Set((atuais ?? []).map((t) => t.turma_id as string));
  const desejadas = new Set(dados.turmas);

  const novas = [...desejadas].filter((t) => !ligadas.has(t));
  const saem = [...ligadas].filter((t) => !desejadas.has(t));
  if (novas.length > 0) {
    const { error: erroTurmas } = await supabase
      .from("atividade_turma")
      .insert(novas.map((turma_id) => ({ atividade_id: atividade.id, turma_id })));
    if (erroTurmas) return { ok: false, erro: "Não foi possível ligar a atividade às turmas." };
  }
  if (saem.length > 0) {
    await supabase.from("atividade_turma").delete().eq("atividade_id", atividade.id).in("turma_id", saem);
  }

  revalidatePath("/professor/atividades");
  revalidatePath(`/atividades/${atividade.id}`);
  return { ok: true };
}

export async function apagarAtividade(formData: FormData) {
  await exigirPapel("professor");
  const id = String(formData.get("id") ?? "");
  const supabase = await criarClienteServidor();
  await supabase.from("atividade").delete().eq("id", id);
  revalidatePath("/professor/atividades");
  redirect("/professor/atividades");
}
