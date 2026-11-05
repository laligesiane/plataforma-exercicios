import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Cabecalho } from "@/components/Cabecalho";
import { andamentoDosAlunos, DIAS_PARADO, itensMaisErrados, type RespostaTurma, type SituacaoAluno } from "@/lib/acompanhamento";
import { ehAutomatico, ehUuid, type Exercicio } from "@/lib/atividades/modelo";
import { textoDoItem } from "@/lib/atividades/resumo";
import { exigirPapel } from "@/lib/perfil";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export const metadata: Metadata = { title: "Acompanhamento da turma · Repasa" };

type Aluno = { id: string; nome: string | null; email: string };

const situacoes: Record<SituacaoAluno, { texto: string; classe: string }> = {
  em_dia: { texto: "Em dia", classe: "bg-primaria-suave text-primaria" },
  parado: { texto: `Parado há ${DIAS_PARADO}+ dias`, classe: "bg-aviso-fundo text-aviso" },
  sem_comecar: { texto: "Não começou", classe: "bg-erro-fundo text-erro" },
};

const formatoDia = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short", timeZone: "America/Sao_Paulo" });

export default async function AcompanhamentoTurma({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!ehUuid(id)) notFound();
  await exigirPapel("professor");
  const supabase = await criarClienteServidor();

  const [{ data: turma }, { data: atribuicoes }] = await Promise.all([
    supabase.from("turma").select("id, nome, turma_aluno(perfil(id, nome, email))").eq("id", id).maybeSingle(),
    supabase.from("atividade_turma").select("atividade(id, titulo, publicada)").eq("turma_id", id),
  ]);
  if (!turma) notFound();

  const alunos = turma.turma_aluno.flatMap((m) => (m.perfil ? [m.perfil as unknown as Aluno] : []));
  const publicadas = (atribuicoes ?? [])
    .flatMap((a) => (a.atividade ? [a.atividade as unknown as { id: string; titulo: string; publicada: boolean }] : []))
    .filter((a) => a.publicada);
  const ids = publicadas.map((a) => a.id);

  const [{ data: exerciciosDb }, { data: respostasDb }] = ids.length
    ? await Promise.all([
        supabase.from("exercicio").select("id, atividade_id, tipo, titulo, instrucoes, itens, config").in("atividade_id", ids),
        supabase.from("resposta").select("aluno_id, atividade_id, item_id, status, criada_em").in("atividade_id", ids),
      ])
    : [{ data: [] }, { data: [] }];

  const exercicios = (exerciciosDb ?? []).map(({ config, ...resto }) => ({ ...(config ?? {}), ...resto }) as Exercicio & { atividade_id: string });
  const automaticos = exercicios.filter(ehAutomatico) as (Exercicio & { atividade_id: string; itens: { id: string }[] })[];
  const atividades = publicadas.map((a) => ({
    ...a,
    totalItens: automaticos.filter((e) => e.atividade_id === a.id).reduce((s, e) => s + e.itens.length, 0),
  }));
  const respostas = (respostasDb ?? []) as RespostaTurma[];
  const alunoIds = alunos.map((a) => a.id);
  const linhas = andamentoDosAlunos(alunoIds, atividades, respostas);
  const dificeis = itensMaisErrados(respostas, alunoIds);
  const tituloAtividade = new Map(atividades.map((a) => [a.id, a.titulo]));
  const item = (atividadeId: string, itemId: string) => {
    for (const e of automaticos) {
      if (e.atividade_id !== atividadeId) continue;
      const achado = (e.itens as Parameters<typeof textoDoItem>[0][]).find((i) => i.id === itemId);
      if (achado) return textoDoItem(achado);
    }
    return null;
  };

  const ordem: SituacaoAluno[] = ["sem_comecar", "parado", "em_dia"];
  const porAluno = new Map(alunos.map((a) => [a.id, a]));
  const ordenadas = [...linhas].sort(
    (a, b) =>
      ordem.indexOf(a.situacao) - ordem.indexOf(b.situacao) ||
      (porAluno.get(a.alunoId)?.nome ?? "").localeCompare(porAluno.get(b.alunoId)?.nome ?? ""),
  );
  const atencao = linhas.filter((l) => l.situacao !== "em_dia").length;

  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-7xl px-4 pt-8 pb-16 sm:px-6 lg:px-8">
        <Link href={`/professor/turmas/${id}`} className="text-sm font-bold text-primaria hover:underline">
          ← {turma.nome}
        </Link>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight">Acompanhamento da turma</h1>
        <p className="mt-2 text-tinta-suave">
          {atividades.length} {atividades.length === 1 ? "atividade publicada" : "atividades publicadas"} · {alunos.length}{" "}
          {alunos.length === 1 ? "aluno" : "alunos"}
          {atencao > 0 ? ` · ${atencao} ${atencao === 1 ? "precisa" : "precisam"} de atenção` : ""}
        </p>

        <section className="mt-8 rounded-2xl border border-linha p-5 sm:p-6">
          <h2 className="text-lg font-bold">Alunos</h2>
          <p className="mt-1 text-sm text-tinta-suave">Quem não começou ou parou aparece primeiro. O acerto conta a última resposta de cada item.</p>
          {alunos.length === 0 ? (
            <p className="mt-3 text-sm text-tinta-suave">A turma ainda não tem alunos.</p>
          ) : (
            <div className="-mx-5 mt-4 overflow-x-auto px-5 sm:-mx-6 sm:px-6">
              <table className="w-full min-w-[34rem] text-left text-sm">
                <thead className="text-xs tracking-wide text-tinta-suave uppercase">
                  <tr>
                    <th className="py-2 pr-3 font-bold">Aluno</th>
                    <th className="py-2 pr-3 font-bold">Situação</th>
                    <th className="py-2 pr-3 font-bold">Atividades</th>
                    <th className="py-2 pr-3 font-bold">Acerto</th>
                    <th className="py-2 font-bold">Última vez</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-linha">
                  {ordenadas.map((l) => {
                    const aluno = porAluno.get(l.alunoId)!;
                    const s = situacoes[l.situacao];
                    return (
                      <tr key={l.alunoId}>
                        <td className="py-2.5 pr-3">
                          <span className="block font-semibold">{aluno.nome ?? "Sem nome"}</span>
                          <span className="block text-xs break-all text-tinta-suave">{aluno.email}</span>
                        </td>
                        <td className="py-2.5 pr-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold whitespace-nowrap ${s.classe}`}>{s.texto}</span>
                        </td>
                        <td className="py-2.5 pr-3 tabular-nums">
                          {l.concluidas} de {atividades.length}
                          {l.emAndamento > 0 && <span className="block text-xs text-tinta-suave">{l.emAndamento} pela metade</span>}
                        </td>
                        <td className="py-2.5 pr-3 tabular-nums">{l.aproveitamento === null ? "–" : `${Math.round(l.aproveitamento * 100)}%`}</td>
                        <td className="py-2.5 tabular-nums">{l.ultimaVez ? formatoDia.format(new Date(l.ultimaVez)) : "–"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-linha p-5 sm:p-6">
          <h2 className="text-lg font-bold">O que a turma mais erra</h2>
          <p className="mt-1 text-sm text-tinta-suave">Itens em que mais alunos erraram pelo menos uma vez, somando todas as atividades.</p>
          {dificeis.length === 0 ? (
            <p className="mt-3 text-sm text-tinta-suave">Nenhum erro registrado ainda.</p>
          ) : (
            <ol className="mt-3 divide-y divide-linha">
              {dificeis.map((d) => (
                <li key={`${d.atividadeId}:${d.itemId}`} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2.5 text-sm">
                  <span className="min-w-0">
                    <span className="block">{item(d.atividadeId, d.itemId) ?? "Item removido da atividade"}</span>
                    <Link href={`/professor/atividades/${d.atividadeId}/respostas`} className="text-xs font-bold text-primaria hover:underline">
                      {tituloAtividade.get(d.atividadeId) ?? "Atividade"}
                    </Link>
                  </span>
                  <span className="shrink-0 font-bold text-erro tabular-nums">
                    {d.alunosComErro} de {d.alunosQueResponderam} {d.alunosQueResponderam === 1 ? "aluno" : "alunos"}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </main>
    </>
  );
}
