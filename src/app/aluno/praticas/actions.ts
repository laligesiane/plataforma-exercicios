"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ehExercicio, ehUuid, limparExercicio, problemasDaAtividade, type Exercicio } from "@/lib/atividades/modelo";
import { textoDoDocumento } from "@/lib/documento";
import { ehTipoGeravel, QUANTIDADES, type TipoGeravel } from "@/lib/pratica/converter";
import { gerarExercicios, iaConfigurada, type ResultadoGeracao } from "@/lib/pratica/gerar";
import { exigirPapel } from "@/lib/perfil";
import { documentoDoResumo, tituloResumo, type Resumo } from "@/lib/resumos";
import { criarClienteServidor } from "@/lib/supabase/servidor";

/** Gerações por aluno a cada 24 horas. */
const LIMITE_DIARIO = 20;
const MINIMO_DE_TEXTO = 80;

export async function gerarPratica(entrada: { resumoId: string; tipos: string[]; quantidade: number }): Promise<ResultadoGeracao> {
  const perfil = await exigirPapel("aluno");
  if (!iaConfigurada()) return { ok: false, erro: "A geração com IA ainda não está ligada no Repasa." };

  const tipos = [...new Set(entrada.tipos)].filter(ehTipoGeravel) as TipoGeravel[];
  if (tipos.length === 0) return { ok: false, erro: "Escolha pelo menos um tipo de exercício." };
  const quantidade = (QUANTIDADES as readonly number[]).includes(entrada.quantidade) ? entrada.quantidade : 5;
  if (!ehUuid(entrada.resumoId)) return { ok: false, erro: "Resumo não encontrado." };

  const supabase = await criarClienteServidor();
  const { data: resumo } = await supabase
    .from("resumo")
    .select("titulo, texto, conteudo, mapa")
    .eq("id", entrada.resumoId)
    .maybeSingle();
  if (!resumo) return { ok: false, erro: "Resumo não encontrado." };

  const texto = textoDoDocumento(documentoDoResumo(resumo as unknown as Resumo)).trim();
  if (texto.length < MINIMO_DE_TEXTO) {
    return { ok: false, erro: "O resumo está curto demais para gerar exercícios. Escreva um pouco mais nele." };
  }

  const desde = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase.from("geracao_ia").select("id", { count: "exact", head: true }).gte("criada_em", desde);
  if ((count ?? 0) >= LIMITE_DIARIO) {
    return { ok: false, erro: `Você já gerou ${LIMITE_DIARIO} vezes nas últimas 24 horas. Volte amanhã para gerar mais.` };
  }
  const { error } = await supabase.from("geracao_ia").insert({ aluno_id: perfil.id });
  if (error) return { ok: false, erro: "Não foi possível gerar agora. Tente de novo." };

  return gerarExercicios({
    tituloResumo: tituloResumo(resumo as unknown as Resumo),
    textoResumo: texto,
    tipos,
    quantidade,
  });
}

export type ResultadoSalvarPratica = { erro: string; problemas?: string[] };

export async function salvarPratica(entrada: {
  id?: string;
  resumoId?: string | null;
  titulo: string;
  exercicios: unknown[];
}): Promise<ResultadoSalvarPratica> {
  await exigirPapel("aluno");
  const titulo = String(entrada.titulo ?? "").trim().slice(0, 200);
  if (!Array.isArray(entrada.exercicios) || entrada.exercicios.length > 20 || !entrada.exercicios.every(ehExercicio)) {
    return { erro: "Não foi possível ler os exercícios." };
  }
  const exercicios = (entrada.exercicios as Exercicio[]).map(limparExercicio);
  if (exercicios.some((e) => e.tipo === "producao" || e.tipo === "kahoot")) return { erro: "Tipo de exercício não permitido." };
  const problemas = problemasDaAtividade(titulo, exercicios);
  if (problemas.length > 0) return { erro: "Falta ajustar algumas coisas antes de salvar.", problemas };

  const supabase = await criarClienteServidor();
  let id = entrada.id;
  if (id) {
    if (!ehUuid(id)) return { erro: "Prática não encontrada." };
    const { error, count } = await supabase
      .from("pratica")
      .update({ titulo, exercicios }, { count: "exact" })
      .eq("id", id);
    if (error || !count) return { erro: "Não foi possível salvar." };
  } else {
    const resumoId = entrada.resumoId && ehUuid(entrada.resumoId) ? entrada.resumoId : null;
    const { data, error } = await supabase
      .from("pratica")
      .insert({ titulo, exercicios, resumo_id: resumoId })
      .select("id")
      .single();
    if (error || !data) return { erro: "Não foi possível salvar." };
    id = data.id as string;
  }

  revalidatePath("/aluno/praticas");
  redirect(`/aluno/praticas/${id}`);
}

export async function apagarPratica(formData: FormData) {
  await exigirPapel("aluno");
  const supabase = await criarClienteServidor();
  await supabase.from("pratica").delete().eq("id", String(formData.get("id") ?? ""));
  revalidatePath("/aluno/praticas");
  redirect("/aluno/praticas");
}
