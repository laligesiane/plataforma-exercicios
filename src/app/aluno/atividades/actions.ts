"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ehUuid, limparExercicio, problemasDaAtividade } from "@/lib/atividades/modelo";
import { cartoesDoDocumento } from "@/lib/documento/cartoes";
import { ehTipoSemIa, juntarCartoes, montarAtividadeSemIa, QUANTIDADES_SEM_IA } from "@/lib/pratica/semIa";
import { exigirPapel } from "@/lib/perfil";
import { camposResumo, documentoDoResumo, tituloResumo, type Resumo } from "@/lib/resumos";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export type EstadoGerar = { erro: string } | null;

/**
 * Cria uma atividade (prática do aluno) com os cartões de um resumo, de uma matéria ou de um curso,
 * sem IA. Salva e abre a atividade para fazer na hora.
 */
export async function criarAtividadeDosResumos(_anterior: EstadoGerar, formData: FormData): Promise<EstadoGerar> {
  await exigirPapel("aluno");
  const [origem, id] = String(formData.get("fonte") ?? "").split(":");
  if (!["resumo", "materia", "curso"].includes(origem) || !ehUuid(id)) return { erro: "Escolha de onde vêm as perguntas." };
  const tipos = formData.getAll("tipo").filter(ehTipoSemIa);
  if (tipos.length === 0) return { erro: "Escolha pelo menos um tipo de pergunta." };
  const pedida = Number(formData.get("quantidade"));
  const quantidade = (QUANTIDADES_SEM_IA as readonly number[]).includes(pedida) ? pedida : 5;

  const supabase = await criarClienteServidor();
  let nome = "";
  let consulta = supabase.from("resumo").select(camposResumo).order("atualizado_em", { ascending: false });
  if (origem === "resumo") {
    consulta = consulta.eq("id", id);
  } else if (origem === "materia") {
    const { data: materia } = await supabase.from("materia").select("nome").eq("id", id).maybeSingle();
    if (!materia) return { erro: "Matéria não encontrada." };
    nome = materia.nome as string;
    consulta = consulta.eq("materia_id", id);
  } else {
    const [{ data: curso }, { data: materias }] = await Promise.all([
      supabase.from("curso").select("nome").eq("id", id).maybeSingle(),
      supabase.from("materia").select("id").eq("curso_id", id),
    ]);
    if (!curso) return { erro: "Curso não encontrado." };
    nome = curso.nome as string;
    const ids = (materias ?? []).map((m) => m.id as string);
    if (ids.length === 0) return { erro: "Esse curso ainda não tem matérias com resumos." };
    consulta = consulta.in("materia_id", ids);
  }
  const { data } = await consulta;
  const resumos = (data ?? []) as unknown as Resumo[];
  if (resumos.length === 0) {
    return { erro: origem === "resumo" ? "Resumo não encontrado." : "Ainda não tem nenhum resumo aqui. Escreva um primeiro." };
  }
  if (origem === "resumo") nome = tituloResumo(resumos[0]);

  const cartoes = juntarCartoes(resumos.map((r) => cartoesDoDocumento(documentoDoResumo(r))));
  const exercicios = montarAtividadeSemIa(cartoes, { tipos, quantidade, semente: crypto.randomUUID() }).map(limparExercicio);
  if (exercicios.length === 0) {
    return {
      erro:
        cartoes.length === 0
          ? "Não achei o que perguntar: use Título (com texto embaixo) e Negrito nos resumos, e as perguntas saem deles."
          : "Tem pouco conteúdo para esses tipos de pergunta. Marque outros tipos ou destaque mais termos em negrito nos resumos.",
    };
  }

  const titulo = `Atividade: ${nome}`.slice(0, 200);
  if (problemasDaAtividade(titulo, exercicios).length > 0) return { erro: "Não deu para montar a atividade. Tente de novo." };

  const { data: salva, error } = await supabase
    .from("pratica")
    .insert({ titulo, exercicios, resumo_id: origem === "resumo" ? id : null })
    .select("id")
    .single();
  if (error || !salva) return { erro: "Não foi possível salvar a atividade. Tente de novo." };

  revalidatePath("/aluno/atividades");
  revalidatePath("/aluno/praticas");
  redirect(`/aluno/praticas/${salva.id}`);
}
