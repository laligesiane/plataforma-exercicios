import Link from "next/link";
import { CartaoAula } from "@/components/CartaoAula";
import { HorariosTurma } from "@/components/HorariosTurma";
import type { Horario } from "@/lib/agenda";
import { etiquetasDaAtividade } from "@/lib/atividades/modelo";
import { camposResumo, tituloResumo, type Resumo } from "@/lib/resumos";
import { camposAula, hojeNoFuso, ultimaAula, type Aula } from "@/lib/aulas";
import { descreverTurma } from "@/lib/turmas";
import { exigirPapel } from "@/lib/perfil";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { LayoutConta } from "../LayoutConta";

type AtividadeResumo = { id: string; titulo: string; nivel: string; categoria: string; atualizada_em: string };

export default async function AtividadesDoAluno() {
  const perfil = await exigirPapel("aluno");
  const supabase = await criarClienteServidor();

  const [{ data: turmas }, { data: atribuicoes }, { data: respostas }, { data: horarios }, { data: aulasDb }, { data: resumosDb }] =
    await Promise.all([
      supabase.from("turma").select("id, nome, materia, idioma_ensinado, idioma_instrucao").order("nome"),
      supabase.from("atividade_turma").select("turma_id, atividade(id, titulo, nivel, categoria, materia, idioma_ensinado, atualizada_em)"),
      supabase.from("resposta").select("atividade_id, item_id").eq("aluno_id", perfil.id),
      supabase.from("turma_horario").select("id, turma_id, dia_semana, hora_inicio, duracao_min, fuso"),
      supabase.from("aula").select(camposAula).order("data", { ascending: false }),
      supabase.from("resumo").select(camposResumo).not("turma_id", "is", null).order("atualizado_em", { ascending: false }),
    ]);
  const resumos = (resumosDb ?? []) as Resumo[];
  const linkResumo = (r: Resumo) => ({ id: r.id, titulo: tituloResumo(r), href: `/aluno/resumos/${r.id}` });

  const hoje = hojeNoFuso();
  const aulasPorTurma = new Map<string, Aula[]>();
  for (const a of (aulasDb ?? []) as Aula[]) aulasPorTurma.set(a.turma_id, [...(aulasPorTurma.get(a.turma_id) ?? []), a]);

  const horariosPorTurma = new Map<string, (Horario & { id: string })[]>();
  for (const h of horarios ?? []) horariosPorTurma.set(h.turma_id, [...(horariosPorTurma.get(h.turma_id) ?? []), h]);

  // Itens já respondidos por atividade, para mostrar "começada".
  const respondidos = new Map<string, Set<string>>();
  for (const r of respostas ?? []) {
    if (!respondidos.has(r.atividade_id)) respondidos.set(r.atividade_id, new Set());
    respondidos.get(r.atividade_id)!.add(r.item_id);
  }

  // Rascunhos vêm como null pelo RLS e ficam de fora.
  const porTurma = new Map<string, AtividadeResumo[]>();
  for (const a of atribuicoes ?? []) {
    const atividade = a.atividade as unknown as AtividadeResumo | null;
    if (!atividade) continue;
    porTurma.set(a.turma_id, [...(porTurma.get(a.turma_id) ?? []), atividade]);
  }

  return (
    <LayoutConta titulo="Minhas atividades" descricao="As atividades e aulas das turmas em que você está.">
      {(turmas ?? []).map((turma) => {
        const atividades = (porTurma.get(turma.id) ?? []).sort((x, y) => y.atualizada_em.localeCompare(x.atualizada_em));
        const aulas = aulasPorTurma.get(turma.id) ?? [];
        const ultima = ultimaAula(aulas, hoje);
        return (
          <section key={turma.id} className="mt-8">
            <h2 className="text-lg font-bold">{turma.nome}</h2>
            <p className="text-sm text-tinta-suave">{descreverTurma(turma)}</p>
            <div className="mt-3">
              <HorariosTurma horarios={horariosPorTurma.get(turma.id) ?? []} nomeTurma={turma.nome} />
            </div>
            {ultima && (
              <div className="mt-3">
                <CartaoAula
                  aula={ultima}
                  destaque="Última aula"
                  resumos={resumos.filter((r) => r.aula_id === ultima.id).map(linkResumo)}
                />
                {aulas.length > 1 && (
                  <Link href={`/aluno/turmas/${turma.id}`} className="mt-2 inline-block text-sm font-bold text-primaria hover:underline">
                    Ver todas as aulas ({aulas.length})
                  </Link>
                )}
              </div>
            )}
            {atividades.length > 0 ? (
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {atividades.map((a) => {
                  const feitos = respondidos.get(a.id)?.size ?? 0;
                  return (
                    <li key={a.id}>
                      <Link
                        href={`/atividades/${a.id}`}
                        className="block h-full rounded-2xl border border-linha p-5 transition-colors hover:border-primaria"
                      >
                        <span className="block font-bold">{a.titulo}</span>
                        <span className="mt-1 block text-sm text-tinta-suave">{etiquetasDaAtividade(a).join(" · ")}</span>
                        <span
                          className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-bold ${feitos > 0 ? "bg-suave text-tinta-suave" : "bg-primaria-suave text-primaria"}`}
                        >
                          {feitos > 0 ? `Começada · ${feitos} ${feitos === 1 ? "item respondido" : "itens respondidos"}` : "Nova"}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-3 rounded-2xl border border-dashed border-linha p-5 text-sm text-tinta-suave">
                Nenhuma atividade publicada nesta turma ainda.
              </p>
            )}
          </section>
        );
      })}

      {(turmas ?? []).length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-linha p-6 text-center">
          <p className="font-semibold">Você ainda não está em nenhuma turma.</p>
          <p className="mt-1 text-sm text-tinta-suave">Quando um professor te convidar, as atividades aparecem aqui.</p>
          <Link href="/experimente" className="mt-3 inline-block text-sm font-bold text-primaria hover:underline">
            Experimentar a aula de demonstração
          </Link>
        </div>
      )}
    </LayoutConta>
  );
}
