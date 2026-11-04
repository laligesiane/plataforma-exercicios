"use server";

import { redirect } from "next/navigation";
import { paginaInicial } from "@/lib/perfil";
import { criarClienteServidor } from "@/lib/supabase/servidor";

/** Primeiro acesso pelo Google: a pessoa diz se é professor ou aluno (uma vez só). */
export async function escolherPapel(formData: FormData) {
  const papel = formData.get("papel") === "professor" ? "professor" : "aluno";
  const supabase = await criarClienteServidor();
  const { error } = await supabase.rpc("escolher_papel", { novo: papel });
  if (error) redirect("/bem-vindo?erro=1");
  redirect(paginaInicial(papel));
}
