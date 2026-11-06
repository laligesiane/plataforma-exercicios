"use server";

import { obterDicionario } from "@/i18n/servidor";
import { revalidatePath } from "next/cache";
import { diaValido, escolherEspecie, proximaMeta, selosNovos, type ArvoreColhida } from "@/lib/foco/colecao";
import { obterPerfil } from "@/lib/perfil";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export type Colheita = {
  especie: string;
  minutos: number;
  /** A espécie ainda não estava na coleção. */
  especieNova: boolean;
  selos: string[];
  proxima: string | null;
  salva: boolean;
};

/**
 * Guarda na coleção a árvore da sessão que acabou de terminar e diz quais selos ela deu.
 * Sem login de aluno (ou sem a tabela), devolve salva: false e a celebração acontece mesmo assim.
 */
export async function colherArvore(minutos: number, dia: string): Promise<Colheita | null> {
  const perfil = await obterPerfil();
  const t = (await obterDicionario()).foco;
  if (!perfil || perfil.papel !== "aluno") return null;
  if (!Number.isInteger(minutos) || minutos < 1 || minutos > 240 || !diaValido(dia)) return null;

  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from("arvore_foco")
    .select("especie, minutos, dia")
    .eq("aluno_id", perfil.id)
    .order("plantada_em", { ascending: false });
  if (error) return null;

  const antes = (data ?? []) as ArvoreColhida[];
  const especie = escolherEspecie(
    antes.map((a) => a.especie),
    antes[0]?.especie ?? null,
  );
  const { error: erroInsert } = await supabase.from("arvore_foco").insert({ especie, minutos, dia });
  if (erroInsert) return null;

  const depois = [{ especie, minutos, dia }, ...antes];
  revalidatePath("/aluno/foco/colecao");
  return {
    especie,
    minutos,
    especieNova: !antes.some((a) => a.especie === especie),
    selos: selosNovos(antes, depois).map((s) => s.id),
    proxima: proximaMeta(depois, dia, t),
    salva: true,
  };
}
