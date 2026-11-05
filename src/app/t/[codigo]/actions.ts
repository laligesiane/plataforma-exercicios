"use server";

import { redirect } from "next/navigation";
import { normalizarCodigo } from "@/lib/codigoTurma";
import { exigirPapel } from "@/lib/perfil";
import { criarClienteServidor } from "@/lib/supabase/servidor";

/** Coloca o aluno logado na turma do código e abre a turma. */
export async function entrarComCodigo(formData: FormData) {
  await exigirPapel("aluno");
  const codigo = normalizarCodigo(String(formData.get("codigo") ?? ""));
  if (!codigo) redirect("/aluno/atividades?codigo=invalido");

  const supabase = await criarClienteServidor();
  const { data: turmaId, error } = await supabase.rpc("entrar_na_turma", { p_codigo: codigo });
  if (error) {
    const motivo = error.message.includes("limite_alunos") ? "cheia" : "invalido";
    redirect(`/t/${codigo}?erro=${motivo}`);
  }
  redirect(`/aluno/turmas/${turmaId}`);
}

/** Leva o aluno do campo "Tenho um código" para a página da turma. */
export async function irParaCodigo(formData: FormData) {
  const codigo = normalizarCodigo(String(formData.get("codigo") ?? ""));
  redirect(codigo ? `/t/${codigo}` : "/aluno/atividades?codigo=invalido");
}
