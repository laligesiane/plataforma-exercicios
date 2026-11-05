"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  categorias,
  configDoExercicio,
  ehEtapa,
  ehExercicio,
  ehUuid,
  limparExercicio,
  niveis,
  normalizarTemas,
  problemasDaAtividade,
  type Atividade,
  type Exercicio,
} from "@/lib/atividades/modelo";
import { dataValida } from "@/lib/aulas";
import { ehIdioma } from "@/lib/idiomas";
import { mensagemDeLimite } from "@/lib/limites";
import { exigirPapel } from "@/lib/perfil";
import { ordemNoFim } from "@/lib/trilha";
import { criarClienteServidor } from "@/lib/supabase/servidor";

/** Cria um rascunho e abre o editor. Usa a matéria (ou os idiomas) da primeira turma, se houver. */
export async function criarAtividade() {
  const professor = await exigirPapel("professor");
  const supabase = await criarClienteServidor();

  const { data: turma } = await supabase
    .from("turma")
    .select("materia, idioma_ensinado, idioma_instrucao")
    .order("criada_em")
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabase
    .from("atividade")
    .insert({
      professor_id: professor.id,
      // Segue a primeira turma (a matéria ou os idiomas dela). Sem turma, nasce como matéria "Geral",
      // que o professor troca no editor; antes nascia como Espanhol, herança da Repasa só de idiomas.
      ...(turma?.idioma_ensinado && turma.idioma_instrucao && !turma.materia?.trim()
        ? { idioma_ensinado: turma.idioma_ensinado, idioma_instrucao: turma.idioma_instrucao }
        : { materia: turma?.materia?.trim() || "Geral", idioma_ensinado: null, idioma_instrucao: null }),
    })
    .select("id")
    .single();

  // Em vez de quebrar a página, volta para a lista com um aviso.
  if (error) redirect("/professor/atividades?erro=criar");
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
  const etapa = atividade.etapa ?? "";
  if (etapa !== "" && !ehEtapa(etapa)) return { ok: false, erro: "Etapa de ensino inválida." };
  const temas = Array.isArray(atividade.temas) ? normalizarTemas(atividade.temas) : [];
  const materia = typeof atividade.materia === "string" ? atividade.materia.trim().slice(0, 60) : "";
  const idiomaEnsinado = atividade.idioma_ensinado;
  const idiomaInstrucao = atividade.idioma_instrucao;
  if (materia) {
    if (idiomaEnsinado !== null || idiomaInstrucao !== null) return { ok: false, erro: "Dados inválidos. Recarregue a página." };
  } else if (typeof atividade.materia === "string" && atividade.materia.trim() === "" && idiomaEnsinado === null) {
    return { ok: false, erro: "Escreva o nome da matéria." };
  } else if (!ehIdioma(idiomaEnsinado ?? "") || !ehIdioma(idiomaInstrucao ?? "")) {
    return { ok: false, erro: "Escolha os dois idiomas." };
  }
  if (!ehUuid(atividade.id) || !Array.isArray(dados.turmas) || !dados.turmas.every(ehUuid)) {
    return { ok: false, erro: "Dados inválidos. Recarregue a página." };
  }
  if (!Array.isArray(dados.exercicios) || !dados.exercicios.every(ehExercicio)) {
    return { ok: false, erro: "Os exercícios vieram num formato inesperado. Recarregue a página." };
  }

  const prazo = atividade.prazo ?? null;
  if (prazo !== null && !dataValida(prazo)) return { ok: false, erro: "Prazo inválido." };

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
      materia,
      idioma_ensinado: materia ? null : idiomaEnsinado,
      idioma_instrucao: materia ? null : idiomaInstrucao,
      explicacao: atividade.explicacao.trim(),
      publicada: atividade.publicada,
      publica: atividade.publica,
      prazo,
      etapa,
      temas,
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
      .insert(novas.map((turma_id) => ({ atividade_id: atividade.id, turma_id, ordem: ordemNoFim() })));
    if (erroTurmas)
      return { ok: false, erro: mensagemDeLimite(erroTurmas.message) ?? "Não foi possível ligar a atividade às turmas." };
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

export type NovaCorrecao = {
  atividadeId: string;
  producaoId: number;
  avaliacao: "muito_bem" | "refazer";
  comentario: string;
};

/** Grava (ou atualiza) a correção de uma produção. O RLS só deixa o dono da atividade. */
export async function corrigirProducao(c: NovaCorrecao): Promise<{ ok: true; corrigidaEm: string } | { ok: false; erro: string }> {
  await exigirPapel("professor");
  if (!ehUuid(c.atividadeId) || !Number.isInteger(c.producaoId) || c.producaoId <= 0) {
    return { ok: false, erro: "Dados inválidos. Recarregue a página." };
  }
  if (c.avaliacao !== "muito_bem" && c.avaliacao !== "refazer") return { ok: false, erro: "Escolha uma avaliação." };
  const comentario = typeof c.comentario === "string" ? c.comentario.trim().slice(0, 3000) : "";

  const supabase = await criarClienteServidor();
  const corrigidaEm = new Date().toISOString();
  const { error } = await supabase.from("correcao").upsert(
    { producao_id: c.producaoId, atividade_id: c.atividadeId, avaliacao: c.avaliacao, comentario, corrigida_em: corrigidaEm },
    { onConflict: "producao_id" },
  );
  if (error) return { ok: false, erro: "Não foi possível salvar a correção. Tente de novo." };

  revalidatePath(`/professor/atividades/${c.atividadeId}/producoes`);
  revalidatePath(`/atividades/${c.atividadeId}`);
  return { ok: true, corrigidaEm };
}

/** Copia uma atividade do professor, com todos os exercícios, como rascunho sem turma. */
export async function duplicarAtividade(formData: FormData) {
  const professor = await exigirPapel("professor");
  const id = String(formData.get("id") ?? "");
  if (!ehUuid(id)) redirect("/professor/atividades?erro=duplicar");
  const supabase = await criarClienteServidor();

  const [{ data: original }, { data: exercicios }] = await Promise.all([
    supabase.from("atividade").select("*").eq("id", id).maybeSingle(),
    supabase.from("exercicio").select("ordem, tipo, titulo, instrucoes, itens, config").eq("atividade_id", id).order("ordem"),
  ]);
  // Copia a própria atividade ou uma pública da biblioteca.
  const daBiblioteca = original?.professor_id !== professor.id;
  if (!original || (daBiblioteca && !(original.publicada && original.publica))) redirect("/professor/atividades?erro=duplicar");

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, criada_em, atualizada_em, publicada, publica, prazo: _prazo, ...campos } = original;
  const { data: copia, error } = await supabase
    .from("atividade")
    .insert({
      ...campos,
      professor_id: professor.id,
      titulo: daBiblioteca ? original.titulo : `Cópia de ${original.titulo}`.slice(0, 200),
      publicada: false,
      publica: false,
    })
    .select("id")
    .single();
  if (error) redirect("/professor/atividades?erro=duplicar");

  if (exercicios?.length) {
    const { error: erroExercicios } = await supabase
      .from("exercicio")
      .insert(exercicios.map((e) => ({ ...e, atividade_id: copia.id })));
    if (erroExercicios) {
      await supabase.from("atividade").delete().eq("id", copia.id);
      redirect("/professor/atividades?erro=duplicar");
    }
  }

  revalidatePath("/professor/atividades");
  redirect(`/professor/atividades/${copia.id}?copia=1`);
}

/** Professor responde (ou corrige a resposta de) uma dúvida. O RLS só deixa o dono da atividade. */
export async function responderDuvida(_estado: { erro?: string; ok?: boolean } | null, formData: FormData) {
  await exigirPapel("professor");
  const id = Number(formData.get("id"));
  const atividadeId = String(formData.get("atividade_id") ?? "");
  const resposta = String(formData.get("resposta") ?? "").trim().slice(0, 2000);
  if (!Number.isSafeInteger(id) || !ehUuid(atividadeId)) return { erro: "Recarregue a página." };
  if (!resposta) return { erro: "Escreva a resposta." };

  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from("duvida")
    .update({ resposta, respondida_em: new Date().toISOString() })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error || !data) return { erro: "Não foi possível salvar a resposta." };
  revalidatePath(`/professor/atividades/${atividadeId}/respostas`);
  return { ok: true };
}
