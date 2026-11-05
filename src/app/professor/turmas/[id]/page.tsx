import Link from "next/link";
import { notFound } from "next/navigation";
import { Cabecalho } from "@/components/Cabecalho";
import { etiquetasDaAtividade } from "@/lib/atividades/modelo";
import { descreverTurma } from "@/lib/turmas";
import { exigirPapel } from "@/lib/perfil";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { CartaoAula } from "@/components/CartaoAula";
import { HorariosTurma } from "@/components/HorariosTurma";
import { camposResumo, tituloResumo, type Resumo } from "@/lib/resumos";
import { BotaoExcluir } from "@/components/BotaoExcluir";
import { apagarResumo } from "./resumos/actions";
import { camposAula, formatarData, hojeNoFuso, tituloAula, ultimaAula, type Aula } from "@/lib/aulas";
import { removerHorario } from "../../actions";
import { apagarAula } from "./actions-aulas";
import { FormularioAula } from "./FormularioAula";
import { FormularioConvite } from "./FormularioConvite";
import { FormularioHorario } from "./FormularioHorario";
import { PedidosAula, type PedidoDaTurma } from "./PedidosAula";

type Aluno = { id: string; nome: string | null; email: string };

export default async function PaginaTurma({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const perfil = await exigirPapel("professor");
  const supabase = await criarClienteServidor();

  const [{ data: turma }, { data: plano }, { data: atribuicoes }, { data: horarios }, { data: aulasDb }, { data: resumosDb }, { data: pedidosDb }] =
    await Promise.all([
    supabase
      .from("turma")
      .select("id, nome, materia, idioma_ensinado, idioma_instrucao, turma_aluno(perfil(id, nome, email))")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("plano").select("max_alunos_por_turma").eq("id", perfil.plano_id).single(),
    supabase.from("atividade_turma").select("atividade(id, titulo, nivel, categoria, materia, publicada)").eq("turma_id", id),
    supabase.from("turma_horario").select("id, dia_semana, hora_inicio, duracao_min, fuso").eq("turma_id", id),
    supabase.from("aula").select(camposAula).eq("turma_id", id).order("data", { ascending: false }),
    supabase.from("resumo").select(camposResumo).eq("turma_id", id).order("atualizado_em", { ascending: false }),
    supabase
      .from("pedido_aula")
      .select("id, data, hora, mensagem, perfil(nome, email)")
      .eq("turma_id", id)
      .eq("status", "pendente")
      .order("data"),
  ]);
  if (!turma) notFound();

  // Relação muitos-para-um: o Supabase devolve um objeto, mas sem tipos gerados o cliente a tipa como lista.
  const alunos = turma.turma_aluno.flatMap((m) => (m.perfil ? [m.perfil as unknown as Aluno] : []));
  const atividades = (atribuicoes ?? []).flatMap((a) =>
    a.atividade ? [a.atividade as unknown as { id: string; titulo: string; nivel: string; categoria: string; materia: string; publicada: boolean }] : [],
  );
  const limite = plano?.max_alunos_por_turma ?? 0;
  const cheia = alunos.length >= limite;
  const aulas = (aulasDb ?? []) as Aula[];
  const hoje = hojeNoFuso();
  const ultima = ultimaAula(aulas, hoje);
  const resumos = (resumosDb ?? []) as Resumo[];
  const resumosDaAula = (aulaId: string) =>
    resumos
      .filter((r) => r.aula_id === aulaId)
      .map((r) => ({ id: r.id, titulo: tituloResumo(r), href: `/professor/turmas/${id}/resumos/${r.id}` }));

  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-3xl px-4 pt-8 pb-16">
        <Link href="/professor" className="text-sm font-bold text-primaria hover:underline">
          ← Minhas turmas
        </Link>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight">{turma.nome}</h1>
        <p className="mt-2 text-tinta-suave">
          {descreverTurma(turma)}
        </p>

        <Link
          href={`/professor/turmas/${turma.id}/acompanhamento`}
          className="mt-5 flex items-center justify-between gap-4 rounded-2xl border-2 border-primaria p-4 transition-colors hover:bg-primaria-suave"
        >
          <span>
            <span className="block font-extrabold">Acompanhamento da turma</span>
            <span className="block text-sm text-tinta-suave">Quem está em dia, quem parou e o que a turma mais erra.</span>
          </span>
          <span aria-hidden className="shrink-0 text-xl font-bold text-primaria">→</span>
        </Link>

        <PedidosAula pedidos={(pedidosDb ?? []) as unknown as PedidoDaTurma[]} turmaId={turma.id} />

        <section className="mt-8 rounded-2xl border border-linha p-5 sm:p-6">
          <h2 className="text-lg font-bold">Dias e horários das aulas</h2>
          <p className="mt-1 mb-4 text-sm text-tinta-suave">
            Os alunos veem os horários e podem colocar as aulas no Google Agenda deles.
          </p>
          <div className="space-y-5">
            <HorariosTurma
              horarios={horarios ?? []}
              nomeTurma={turma.nome}
              acaoRemover={removerHorario}
              turmaId={turma.id}
              editar={(h) => (
                <FormularioHorario
                  key={`${h.id}-${h.dia_semana}-${h.hora_inicio}-${h.duracao_min}`}
                  turmaId={turma.id}
                  horario={h}
                />
              )}
            />
            <FormularioHorario turmaId={turma.id} />
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-linha p-5 sm:p-6">
          <h2 className="text-lg font-bold">Aulas</h2>
          <p className="mt-1 mb-4 text-sm text-tinta-suave">
            Registre o que foi visto em cada aula. Os alunos veem o resumo, o que fica para a próxima e a tarefa de casa.
          </p>
          {ultima && (
            <div className="mb-5">
              <CartaoAula aula={ultima} destaque="Última aula" resumos={resumosDaAula(ultima.id)} />
            </div>
          )}
          <details className="rounded-xl bg-suave p-4" open={aulas.length === 0}>
            <summary className="cursor-pointer font-bold text-primaria">Registrar aula</summary>
            <div className="mt-4">
              <FormularioAula turmaId={turma.id} hoje={hoje} />
            </div>
          </details>
          {aulas.length > 0 && (
            <ul className="mt-4 divide-y divide-linha">
              {aulas.map((a) => (
                <li key={a.id} className="py-3">
                  <details>
                    <summary className="flex cursor-pointer flex-wrap items-baseline justify-between gap-x-4">
                      <span className="font-semibold">{tituloAula(a)}</span>
                      <span className="text-sm text-tinta-suave">{formatarData(a.data)}</span>
                    </summary>
                    <div className="mt-3 space-y-3">
                      <CartaoAula aula={a} resumos={resumosDaAula(a.id)} />
                      <Link
                        href={`/professor/turmas/${turma.id}/resumos/novo?aula=${a.id}`}
                        className="inline-block text-sm font-bold text-primaria hover:underline"
                      >
                        + Resumo ou mapa mental desta aula
                      </Link>
                      <details className="rounded-xl bg-suave p-4">
                        <summary className="cursor-pointer text-sm font-bold text-tinta-suave hover:text-tinta">
                          Editar
                        </summary>
                        <div className="mt-4">
                          <FormularioAula
                            key={`${a.id}-${a.data}-${a.titulo}-${a.resumo.length}`}
                            turmaId={turma.id}
                            hoje={hoje}
                            aula={a}
                          />
                        </div>
                      </details>
                      <form action={apagarAula}>
                        <input type="hidden" name="id" value={a.id} />
                        <input type="hidden" name="turma_id" value={turma.id} />
                        <button type="submit" className="text-sm font-bold text-tinta-suave hover:text-erro">
                          Apagar aula
                        </button>
                      </form>
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-linha p-5 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-bold">Resumos e mapas mentais</h2>
            <Link
              href={`/professor/turmas/${turma.id}/resumos/novo`}
              className="text-sm font-bold text-primaria hover:underline"
            >
              + Novo resumo
            </Link>
          </div>
          {resumos.length > 0 ? (
            <ul className="mt-3 divide-y divide-linha">
              {resumos.map((r) => {
                const aula = aulas.find((a) => a.id === r.aula_id);
                return (
                  <li key={r.id} className="flex flex-wrap items-baseline justify-between gap-x-4 py-3">
                    <Link
                      href={`/professor/turmas/${turma.id}/resumos/${r.id}`}
                      className="font-semibold hover:text-primaria"
                    >
                      {tituloResumo(r)}
                    </Link>
                    <span className="flex items-baseline gap-4 text-sm text-tinta-suave">
                      {aula ? tituloAula(aula) : "Sem aula específica"}
                      <BotaoExcluir
                        acao={apagarResumo}
                        campos={{ id: r.id, turma_id: turma.id }}
                        pergunta={`Excluir o resumo "${tituloResumo(r)}"? Os alunos deixam de vê-lo. Não dá para desfazer.`}
                        discreto
                      />
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-tinta-suave">
              Monte um mapa mental ou um resumo para os alunos revisarem o conteúdo.
            </p>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-linha p-5 sm:p-6">
          <h2 className="mb-4 text-lg font-bold">Convidar aluno</h2>
          {cheia ? (
            <p className="rounded-xl bg-suave px-3.5 py-2.5 text-sm text-tinta-suave">
              A turma chegou ao limite de {limite} alunos do seu plano.
            </p>
          ) : (
            <FormularioConvite turmaId={turma.id} />
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-linha p-5 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-bold">Atividades da turma</h2>
            <Link href="/professor/atividades" className="text-sm font-bold text-primaria hover:underline">
              Todas as atividades
            </Link>
          </div>
          {atividades.length > 0 ? (
            <ul className="mt-3 divide-y divide-linha">
              {atividades.map((a) => (
                <li key={a.id} className="flex flex-wrap items-baseline justify-between gap-x-4 py-3">
                  <Link href={`/professor/atividades/${a.id}`} className="font-semibold hover:text-primaria">
                    {a.titulo}
                  </Link>
                  <span className="text-sm text-tinta-suave">
                    {etiquetasDaAtividade(a)[0]} · {a.publicada ? "Publicada" : "Rascunho"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-tinta-suave">
              Nenhuma atividade ainda. Crie uma em Atividades e marque esta turma.
            </p>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-linha p-5 sm:p-6">
          <h2 className="text-lg font-bold">
            Alunos{" "}
            <span className="font-semibold text-tinta-suave tabular-nums">
              ({alunos.length} de {limite})
            </span>
          </h2>
          {alunos.length > 0 ? (
            <ul className="mt-3 divide-y divide-linha">
              {alunos.map((aluno) => (
                <li key={aluno.id} className="flex flex-wrap items-baseline justify-between gap-x-4 py-3">
                  <span className="font-semibold">{aluno.nome ?? "Sem nome"}</span>
                  <span className="min-w-0 text-sm break-all text-tinta-suave">{aluno.email}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-tinta-suave">Nenhum aluno ainda. Os convidados aparecem aqui.</p>
          )}
        </section>
      </main>
    </>
  );
}
