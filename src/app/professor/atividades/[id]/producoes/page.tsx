import Link from "next/link";
import { notFound } from "next/navigation";
import { Cabecalho } from "@/components/Cabecalho";
import { carregarAtividade } from "@/lib/atividades/carregar";
import { ehUuid, type ExercicioProducao } from "@/lib/atividades/modelo";
import { montarProducoes, type LinhaProducao } from "@/lib/atividades/producoes";
import { exigirPapel } from "@/lib/perfil";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { CorrigirProducao } from "./CorrigirProducao";

type Aluno = { id: string; nome: string | null; email: string };
type Linha = LinhaProducao & { id: number; aluno_id: string; item_id: string };

export const metadata = { title: "Corrigir produções · Repasa" };

export default async function Producoes({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const professor = await exigirPapel("professor");
  if (!ehUuid(id)) notFound();

  const supabase = await criarClienteServidor();
  const [carregada, { data: linhasDb }, { data: atribuicoes }] = await Promise.all([
    carregarAtividade(id),
    supabase
      .from("producao")
      .select("id, aluno_id, item_id, texto, audio, enviada_em, correcao(avaliacao, comentario, corrigida_em)")
      .eq("atividade_id", id)
      .order("enviada_em", { ascending: false }),
    supabase.from("atividade_turma").select("turma(turma_aluno(perfil(id, nome, email)))").eq("atividade_id", id),
  ]);
  if (!carregada || carregada.atividade.professor_id !== professor.id) notFound();

  const alunos = new Map<string, Aluno>();
  for (const a of atribuicoes ?? []) {
    const turma = a.turma as unknown as { turma_aluno: { perfil: Aluno | null }[] } | null;
    for (const m of turma?.turma_aluno ?? []) if (m.perfil) alunos.set(m.perfil.id, m.perfil);
  }

  const linhas = (linhasDb ?? []) as unknown as Linha[];
  const montadas = await montarProducoes(supabase, linhas);
  const exercicios = carregada.exercicios.filter((e): e is ExercicioProducao => e.tipo === "producao");
  const faltam = montadas.filter(([, p]) => !p.correcao || p.correcao.anterior).length;
  const quando = (iso: string) =>
    new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });

  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-3xl px-4 pt-8 pb-16">
        <Link href={`/professor/atividades/${id}/respostas`} className="text-sm font-bold text-primaria hover:underline">
          ← Respostas da atividade
        </Link>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight">{carregada.atividade.titulo}</h1>
        <p className="mt-2 text-tinta-suave">
          Produções escritas e orais.{" "}
          {linhas.length === 0
            ? "Nenhum aluno enviou ainda."
            : faltam === 0
              ? "Tudo corrigido."
              : `${faltam} esperando sua correção.`}
        </p>

        {exercicios.flatMap((exercicio) =>
          exercicio.itens.map((item) => {
            const doItem = linhas
              .map((l, i) => ({ linha: l, salva: montadas[i][1] }))
              .filter(({ linha }) => linha.item_id === item.id)
              // Sem correção (ou com versão nova) primeiro.
              .sort((a, b) => Number(Boolean(a.salva.correcao && !a.salva.correcao.anterior)) - Number(Boolean(b.salva.correcao && !b.salva.correcao.anterior)));
            return (
              <section key={item.id} className="mt-8 rounded-2xl border border-linha p-5 sm:p-6">
                <p className="text-xs font-bold tracking-wide text-tinta-suave uppercase">
                  {exercicio.titulo} · {item.modo === "oral" ? "oral" : "escrita"}
                </p>
                <h2 className="mt-1 text-lg font-bold whitespace-pre-line">{item.enunciado}</h2>
                {item.orientacao && <p className="mt-1 text-sm text-tinta-suave">O que você espera: {item.orientacao}</p>}

                {doItem.length === 0 ? (
                  <p className="mt-4 text-sm text-tinta-suave">Ninguém enviou esta ainda.</p>
                ) : (
                  <ul className="mt-4 space-y-4">
                    {doItem.map(({ linha, salva }) => {
                      const aluno = alunos.get(linha.aluno_id);
                      return (
                        <li key={linha.id} className="rounded-xl bg-suave p-4">
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <span className="font-bold">{aluno?.nome || aluno?.email || "Aluno que saiu da turma"}</span>
                            <span className="text-xs text-tinta-suave">
                              Enviada {quando(salva.enviadaEm)}
                              {salva.correcao?.anterior ? " · versão nova depois da correção" : ""}
                            </span>
                          </div>
                          {salva.texto && <p className="mt-2 rounded-lg bg-fundo p-3 whitespace-pre-line">{salva.texto}</p>}
                          {salva.audioUrl && <audio controls preload="metadata" src={salva.audioUrl} className="mt-2 w-full" />}
                          {linha.audio && !salva.audioUrl && (
                            <p className="mt-2 text-sm text-erro">Não conseguimos abrir o áudio. Recarregue a página.</p>
                          )}
                          <CorrigirProducao atividadeId={id} producaoId={linha.id} inicial={salva.correcao} />
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          }),
        )}
      </main>
    </>
  );
}
