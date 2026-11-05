import type { Metadata } from "next";
import Link from "next/link";
import { Mascote } from "@/components/Mascote";
import { hojeNoFuso } from "@/lib/aulas";
import { ehAutomatico, type Exercicio } from "@/lib/atividades/modelo";
import { exigirPapel } from "@/lib/perfil";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { LayoutConta } from "../LayoutConta";
import { SessaoRevisao, type GrupoRevisao } from "./SessaoRevisao";

export const metadata: Metadata = { title: "Repasar meus erros · Repasa" };

/** Itens por sessão, para a revisão caber em poucos minutos. */
const LIMITE = 30;

type Linha = { id: number; atividade_id: string; exercicio_id: string; item_id: string; etapa: number };

export default async function Revisar() {
  const perfil = await exigirPapel("aluno");
  const supabase = await criarClienteServidor();
  const hoje = hojeNoFuso();

  const [{ data: devidas }, { count: depois }, { count: dominados }] = await Promise.all([
    supabase
      .from("revisao")
      .select("id, atividade_id, exercicio_id, item_id, etapa")
      .eq("aluno_id", perfil.id)
      .is("concluida_em", null)
      .lte("proxima_em", hoje)
      .order("proxima_em")
      .limit(LIMITE),
    supabase
      .from("revisao")
      .select("id", { count: "exact", head: true })
      .eq("aluno_id", perfil.id)
      .is("concluida_em", null)
      .gt("proxima_em", hoje),
    supabase.from("revisao").select("id", { count: "exact", head: true }).eq("aluno_id", perfil.id).not("concluida_em", "is", null),
  ]);

  const grupos = await montarGrupos((devidas ?? []) as Linha[]);
  const total = grupos.reduce((soma, g) => soma + g.exercicio.itens.length, 0);

  return (
    <LayoutConta
      titulo="Repasar meus erros"
      descricao="Os itens que você errou voltam depois de 1, 3 e 7 dias. Acertou de primeira nas três vezes, o item está dominado."
    >
      <p className="mt-6 text-sm font-semibold text-tinta-suave">
        {total} para hoje · {depois ?? 0} para os próximos dias · {dominados ?? 0} dominados
      </p>
      {total === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-2xl bg-suave p-8 text-center">
          <Mascote tamanho={96} animado />
          <p className="mt-3 text-lg font-extrabold">Nada para repassar hoje.</p>
          <p className="mt-1 text-sm text-tinta-suave">
            {(depois ?? 0) > 0
              ? "Os próximos itens voltam nos próximos dias."
              : "Quando você errar um item numa atividade, ele aparece aqui para você repassar."}
          </p>
          <Link href="/aluno/atividades" className="mt-4 text-sm font-bold text-primaria hover:underline">
            Ver atividades
          </Link>
        </div>
      ) : (
        <div className="mt-6">
          <SessaoRevisao grupos={grupos} />
        </div>
      )}
    </LayoutConta>
  );
}

/** Junta os itens devidos por exercício, com o título da atividade. Itens apagados pelo professor ficam de fora. */
async function montarGrupos(linhas: Linha[]): Promise<GrupoRevisao[]> {
  if (linhas.length === 0) return [];
  const supabase = await criarClienteServidor();
  const exercicioIds = [...new Set(linhas.map((l) => l.exercicio_id))];
  const atividadeIds = [...new Set(linhas.map((l) => l.atividade_id))];
  const [{ data: exercicios }, { data: atividades }] = await Promise.all([
    supabase.from("exercicio").select("id, atividade_id, tipo, titulo, instrucoes, itens, config").in("id", exercicioIds),
    supabase.from("atividade").select("id, titulo").in("id", atividadeIds),
  ]);
  const tituloAtividade = new Map((atividades ?? []).map((a) => [a.id, a.titulo as string]));

  const grupos: GrupoRevisao[] = [];
  for (const linha of exercicios ?? []) {
    const { config, atividade_id, ...resto } = linha;
    const exercicio = { ...(config ?? {}), ...resto } as Exercicio;
    if (!ehAutomatico(exercicio)) continue;
    const devidas = linhas.filter((l) => l.exercicio_id === exercicio.id);
    const ids = new Map(devidas.map((l) => [l.item_id, l.id]));
    const itens = (exercicio.itens as { id: string }[]).filter((i) => ids.has(i.id));
    if (itens.length === 0) continue;
    grupos.push({
      atividadeId: atividade_id,
      atividadeTitulo: tituloAtividade.get(atividade_id) ?? "Atividade",
      exercicio: { ...exercicio, itens } as Exercicio,
      revisaoPorItem: Object.fromEntries(ids),
    });
  }
  return grupos;
}
