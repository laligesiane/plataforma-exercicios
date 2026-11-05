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
import { CampoCodigoTurma } from "@/components/CampoCodigoTurma";
import { estadoTrilha } from "@/lib/trilha";
import { Icone } from "@/components/jogos/Icones";
import { carregarResumosDoAluno } from "../dados";
import { contarItens } from "../praticas/dados";
import { LayoutConta } from "../LayoutConta";
import { CartaoRepasar } from "./CartaoRepasar";
import { GerarAtividade } from "./GerarAtividade";

/** Quantas atividades criadas pelo aluno aparecem aqui; o resto fica em "Ver todas". */
const CRIADAS_NA_PAGINA = 6;

type AtividadeResumo = { id: string; titulo: string; nivel: string; categoria: string; atualizada_em: string };

const formatoData = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short" });

export default async function AtividadesDoAluno({ searchParams }: { searchParams: Promise<{ codigo?: string }> }) {
  const { codigo } = await searchParams;
  const perfil = await exigirPapel("aluno");
  const supabase = await criarClienteServidor();

  const [
    { data: turmas },
    { data: atribuicoes },
    { data: respostas },
    { data: horarios },
    { data: aulasDb },
    { data: resumosDb },
    { data: envios },
    todosResumos,
    { data: materiasDb },
    { data: cursosDb },
    { data: praticasDb },
  ] = await Promise.all([
      supabase.from("turma").select("id, nome, trilha, materia, idioma_ensinado, idioma_instrucao").order("nome"),
      supabase.from("atividade_turma").select("turma_id, ordem, atividade(id, titulo, nivel, categoria, materia, idioma_ensinado, atualizada_em)").order("ordem"),
      supabase.from("resposta").select("atividade_id, item_id").eq("aluno_id", perfil.id),
      supabase.from("turma_horario").select("id, turma_id, dia_semana, hora_inicio, duracao_min, fuso"),
      supabase.from("aula").select(camposAula).order("data", { ascending: false }),
      supabase.from("resumo").select(camposResumo).not("turma_id", "is", null).order("atualizado_em", { ascending: false }),
      supabase.from("envio").select("atividade_id").eq("aluno_id", perfil.id),
      carregarResumosDoAluno(),
      supabase.from("materia").select("id, nome, resumo(count)").order("nome"),
      supabase.from("curso").select("id, nome").order("nome"),
      supabase.from("pratica").select("id, titulo, exercicios, criada_em").order("criada_em", { ascending: false }).limit(CRIADAS_NA_PAGINA + 1),
    ]);
  const praticas = praticasDb ?? [];
  const materias = (materiasDb ?? []).map((m) => ({
    id: m.id as string,
    nome: m.nome as string,
    resumos: (m.resumo as unknown as { count: number }[] | null)?.[0]?.count ?? 0,
  }));
  const enviadas = new Set((envios ?? []).map((e) => e.atividade_id as string));
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
    <LayoutConta titulo="Minhas atividades" descricao="As atividades das suas turmas e as que você cria com seus resumos.">
      <CartaoRepasar alunoId={perfil.id} />
      <CampoCodigoTurma invalido={codigo === "invalido"} />
      <GerarAtividade
        resumos={todosResumos.map((r) => ({ id: r.id, nome: r.titulo_exibido, origem: r.origem }))}
        materias={materias}
        cursos={(cursosDb ?? []).map((c) => ({ id: c.id as string, nome: c.nome as string }))}
      />

      {praticas.length > 0 && (
        <section className="mt-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-bold">Criadas por você</h2>
            {praticas.length > CRIADAS_NA_PAGINA && (
              <Link href="/aluno/praticas" className="text-sm font-bold text-primaria hover:underline">
                Ver todas
              </Link>
            )}
          </div>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {praticas.slice(0, CRIADAS_NA_PAGINA).map((p) => {
              const itens = contarItens(p.exercicios);
              return (
                <li key={p.id}>
                  <Link
                    href={`/aluno/praticas/${p.id}`}
                    className="block h-full rounded-2xl border border-linha p-5 transition-colors hover:border-primaria"
                  >
                    <span className="block font-bold">{p.titulo}</span>
                    <span className="mt-1 block text-sm text-tinta-suave">
                      {itens} {itens === 1 ? "pergunta" : "perguntas"} · {formatoData.format(new Date(p.criada_em))}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
      {(turmas ?? []).map((turma) => {
        // Na trilha vale a ordem do professor; fora dela, as mais recentes primeiro.
        const daTurma = porTurma.get(turma.id) ?? [];
        const atividades = estadoTrilha(
          turma.trilha ? daTurma : [...daTurma].sort((x, y) => y.atualizada_em.localeCompare(x.atualizada_em)),
          enviadas,
          Boolean(turma.trilha),
        );
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
                {atividades.map((a, i) => {
                  const feitos = respondidos.get(a.id)?.size ?? 0;
                  if (!a.liberada) {
                    return (
                      <li key={a.id}>
                        <div className="h-full rounded-2xl border border-dashed border-linha p-5 text-tinta-suave" aria-label={`${a.titulo}: bloqueada`}>
                          <span className="block font-bold">
                            {i + 1}. {a.titulo}
                          </span>
                          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-suave px-3 py-1 text-xs font-bold">
                            <Icone nome="cadeado" className="size-3.5" />
                            Abre depois da anterior
                          </span>
                        </div>
                      </li>
                    );
                  }
                  return (
                    <li key={a.id}>
                      <Link
                        href={`/atividades/${a.id}`}
                        className="block h-full rounded-2xl border border-linha p-5 transition-colors hover:border-primaria"
                      >
                        <span className="block font-bold">
                          {turma.trilha ? `${i + 1}. ` : ""}
                          {a.titulo}
                        </span>
                        <span className="mt-1 block text-sm text-tinta-suave">{etiquetasDaAtividade(a).join(" · ")}</span>
                        <span
                          className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${feitos > 0 ? "bg-suave text-tinta-suave" : "bg-primaria-suave text-primaria"}`}
                        >
                          {a.enviada ? (
                            <>
                              <Icone nome="certo" className="size-3.5" />
                              Enviada
                            </>
                          ) : feitos > 0 ? (
                            `Começada · ${feitos} ${feitos === 1 ? "item respondido" : "itens respondidos"}`
                          ) : (
                            "Nova"
                          )}
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
