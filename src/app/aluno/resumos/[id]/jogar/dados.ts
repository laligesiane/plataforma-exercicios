import "server-only";
import { notFound } from "next/navigation";
import { cartoesDoDocumento } from "@/lib/documento/cartoes";
import { exigirPapel } from "@/lib/perfil";
import { camposResumo, documentoDoResumo, tituloResumo, type Resumo } from "@/lib/resumos";
import { criarClienteServidor } from "@/lib/supabase/servidor";

/** O resumo e todos os cartões que saem dele. Cada jogo depois pega no máximo 10 por rodada. */
export async function carregarCartoes(id: string) {
  await exigirPapel("aluno");
  const supabase = await criarClienteServidor();
  const { data } = await supabase.from("resumo").select(camposResumo).eq("id", id).maybeSingle();
  if (!data) notFound();
  const resumo = data as unknown as Resumo;
  return { titulo: tituloResumo(resumo), cartoes: cartoesDoDocumento(documentoDoResumo(resumo)) };
}
