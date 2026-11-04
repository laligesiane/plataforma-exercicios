"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { EstadoFormulario } from "@/components/ui/Mensagem";
import { ehIdioma } from "@/lib/idiomas";
import { mensagemDeLimite } from "@/lib/limites";
import { exigirPapel } from "@/lib/perfil";
import { criarClienteAdmin } from "@/lib/supabase/admin";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export async function criarTurma(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const professor = await exigirPapel("professor");

  const nome = String(formData.get("nome") ?? "").trim();
  const idiomaEnsinado = String(formData.get("idioma_ensinado") ?? "");
  const idiomaInstrucao = String(formData.get("idioma_instrucao") ?? "");
  if (!nome) return { erro: "Dê um nome para a turma." };
  if (!ehIdioma(idiomaEnsinado) || !ehIdioma(idiomaInstrucao)) return { erro: "Escolha os dois idiomas." };

  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from("turma")
    .insert({ professor_id: professor.id, nome, idioma_ensinado: idiomaEnsinado, idioma_instrucao: idiomaInstrucao })
    .select("id")
    .single();

  if (error) return { erro: mensagemDeLimite(error.message) ?? "Não foi possível criar a turma." };

  revalidatePath("/professor");
  redirect(`/professor/turmas/${data.id}`);
}

export async function convidarAluno(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  await exigirPapel("professor");

  const turmaId = String(formData.get("turma_id") ?? "");
  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!nome || !email) return { erro: "Preencha nome e e-mail do aluno." };

  // Confere pelo RLS que a turma é deste professor antes de usar o cliente admin.
  const supabase = await criarClienteServidor();
  const { data: turma } = await supabase.from("turma").select("id").eq("id", turmaId).single();
  if (!turma) return { erro: "Turma não encontrada." };

  const admin = criarClienteAdmin();
  const { data: existente } = await admin.from("perfil").select("id, papel").eq("email", email).maybeSingle();

  let alunoId = existente?.id;
  if (existente && existente.papel !== "aluno") return { erro: "Esse e-mail é de uma conta de professor." };

  if (!alunoId) {
    const origem = (await headers()).get("origin") ?? "";
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { nome, papel: "aluno" },
      redirectTo: `${origem}/auth/convite`,
    });
    if (error || !data.user) return { erro: `Não foi possível enviar o convite: ${error?.message ?? "erro desconhecido"}` };
    alunoId = data.user.id;
  }

  const { error } = await admin.from("turma_aluno").insert({ turma_id: turma.id, aluno_id: alunoId });
  if (error) {
    if (error.code === "23505") return { erro: "Esse aluno já está na turma." };
    return { erro: mensagemDeLimite(error.message) ?? "Não foi possível adicionar o aluno." };
  }

  revalidatePath(`/professor/turmas/${turma.id}`);
  return {
    sucesso: existente ? `${nome} já tinha conta e foi adicionado à turma.` : `Convite enviado para ${email}.`,
  };
}

export async function salvarHorario(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  await exigirPapel("professor");

  const id = String(formData.get("id") ?? "");
  const turmaId = String(formData.get("turma_id") ?? "");
  const dia = Number(formData.get("dia_semana"));
  const hora = String(formData.get("hora_inicio") ?? "");
  const duracao = Number(formData.get("duracao_min"));
  if (!Number.isInteger(dia) || dia < 0 || dia > 6) return { erro: "Escolha o dia da semana." };
  if (!/^\d{2}:\d{2}$/.test(hora)) return { erro: "Informe o horário de início." };
  if (!Number.isInteger(duracao) || duracao < 15 || duracao > 480) return { erro: "A duração vai de 15 a 480 minutos." };

  const supabase = await criarClienteServidor();
  const valores = { dia_semana: dia, hora_inicio: hora, duracao_min: duracao };
  const { error } = id
    ? await supabase.from("turma_horario").update(valores).eq("id", id)
    : await supabase.from("turma_horario").insert({ turma_id: turmaId, ...valores });
  if (error) {
    if (error.code === "23505") return { erro: "Já existe uma aula nesse dia e horário. Edite a que já está na lista." };
    return { erro: "Não foi possível salvar o horário." };
  }

  revalidatePath(`/professor/turmas/${turmaId}`);
  return { sucesso: id ? "Horário atualizado." : "Horário adicionado." };
}

export async function removerHorario(formData: FormData) {
  await exigirPapel("professor");
  const id = String(formData.get("id") ?? "");
  const turmaId = String(formData.get("turma_id") ?? "");
  const supabase = await criarClienteServidor();
  await supabase.from("turma_horario").delete().eq("id", id);
  revalidatePath(`/professor/turmas/${turmaId}`);
}
