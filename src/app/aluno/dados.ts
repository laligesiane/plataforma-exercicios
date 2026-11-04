import "server-only";
import { camposResumo, tituloResumo, type Resumo } from "@/lib/resumos";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export type ResumoComOrigem = Resumo & { titulo_exibido: string; origem: string; cor: string | null };

/** Todos os resumos que o aluno vê: os das suas matérias e os das suas turmas. */
export async function carregarResumosDoAluno(): Promise<ResumoComOrigem[]> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("resumo")
    .select(`${camposResumo}, materia(nome, cor), turma(nome)`)
    .order("atualizado_em", { ascending: false });

  return (data ?? []).map((linha) => {
    const materia = linha.materia as unknown as { nome: string; cor: string } | null;
    const turma = linha.turma as unknown as { nome: string } | null;
    const r = linha as unknown as Resumo;
    return {
      ...r,
      titulo_exibido: tituloResumo(r),
      origem: materia?.nome ?? turma?.nome ?? "",
      cor: materia?.cor ?? null,
    };
  });
}
