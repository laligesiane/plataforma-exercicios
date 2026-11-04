import Link from "next/link";
import { notFound } from "next/navigation";
import { Cabecalho } from "@/components/Cabecalho";
import { normalizarBasico } from "@/lib/correcao/normalizar";
import { carregarAtividade } from "@/lib/atividades/carregar";
import { ehUuid, type Exercicio } from "@/lib/atividades/modelo";
import { exigirPapel } from "@/lib/perfil";
import { criarClienteServidor } from "@/lib/supabase/servidor";

type Resposta = { aluno_id: string; item_id: string; valor: string; status: string };
type Aluno = { id: string; nome: string | null; email: string };

export default async function RespostasAtividade({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const professor = await exigirPapel("professor");
  if (!ehUuid(id)) notFound();

  const supabase = await criarClienteServidor();
  const [carregada, { data: respostas }, { data: atribuicoes }] = await Promise.all([
    carregarAtividade(id),
    supabase.from("resposta").select("aluno_id, item_id, valor, status").eq("atividade_id", id).order("criada_em"),
    supabase.from("atividade_turma").select("turma(nome, turma_aluno(perfil(id, nome, email)))").eq("atividade_id", id),
  ]);
  if (!carregada || carregada.atividade.professor_id !== professor.id) notFound();

  const { atividade, exercicios } = carregada;
  const itens = exercicios.flatMap((e): { id: string }[] => e.itens);

  // Alunos das turmas que receberam a atividade (sem repetir quem está em duas).
  const alunos = new Map<string, Aluno>();
  for (const a of atribuicoes ?? []) {
    const turma = a.turma as unknown as { turma_aluno: { perfil: Aluno | null }[] } | null;
    for (const m of turma?.turma_aluno ?? []) if (m.perfil) alunos.set(m.perfil.id, m.perfil);
  }

  const lista = (respostas ?? []) as Resposta[];
  const ultima = new Map<string, Resposta>(); // aluno:item → última resposta
  const tentativas = new Map<string, number>();
  for (const r of lista) {
    ultima.set(`${r.aluno_id}:${r.item_id}`, r);
    tentativas.set(r.aluno_id, (tentativas.get(r.aluno_id) ?? 0) + 1);
  }

  const linhas = [...alunos.values()]
    .map((aluno) => {
      let respondidos = 0;
      let certos = 0;
      for (const item of itens) {
        const r = ultima.get(`${aluno.id}:${item.id}`);
        if (!r) continue;
        respondidos++;
        if (r.status !== "errado") certos++;
      }
      return { aluno, respondidos, certos, tentativas: tentativas.get(aluno.id) ?? 0 };
    })
    .sort((a, b) => (a.aluno.nome ?? a.aluno.email).localeCompare(b.aluno.nome ?? b.aluno.email));

  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-3xl px-4 pt-8 pb-16">
        <Link href={`/professor/atividades/${id}`} className="text-sm font-bold text-primaria hover:underline">
          ← Voltar ao editor
        </Link>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight">{atividade.titulo}</h1>
        <p className="mt-2 text-tinta-suave">Respostas dos alunos. Conta a última tentativa de cada item.</p>

        <section className="mt-8 rounded-2xl border border-linha p-5 sm:p-6">
          <h2 className="text-lg font-bold">Por aluno</h2>
          {linhas.length > 0 ? (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-tinta-suave">
                  <tr>
                    <th className="py-2 pr-3 font-semibold">Aluno</th>
                    <th className="py-2 pr-3 font-semibold tabular-nums">Respondidos</th>
                    <th className="py-2 pr-3 font-semibold tabular-nums">Certos</th>
                    <th className="py-2 font-semibold tabular-nums">Tentativas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-linha">
                  {linhas.map(({ aluno, respondidos, certos, tentativas }) => (
                    <tr key={aluno.id}>
                      <td className="py-2.5 pr-3">
                        <span className="block font-semibold">{aluno.nome ?? "Sem nome"}</span>
                        <span className="block text-xs break-all text-tinta-suave">{aluno.email}</span>
                      </td>
                      <td className="py-2.5 pr-3 tabular-nums">
                        {respondidos} de {itens.length}
                      </td>
                      <td className="py-2.5 pr-3 font-bold tabular-nums">
                        {respondidos > 0 ? <span className={certos === respondidos ? "text-certo" : ""}>{certos}</span> : "–"}
                      </td>
                      <td className="py-2.5 tabular-nums">{tentativas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-2 text-sm text-tinta-suave">
              Nenhum aluno recebeu esta atividade ainda. Marque uma turma no editor.
            </p>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-linha p-5 sm:p-6">
          <h2 className="text-lg font-bold">Erros mais comuns</h2>
          <p className="mt-1 text-sm text-tinta-suave">
            Respostas erradas sem explicação própria aparecem marcadas. Vale adicioná-las como erro previsto.
          </p>
          <div className="mt-4 space-y-5">
            {exercicios.map((exercicio, i) => (
              <ErrosDoExercicio key={exercicio.id} numero={i + 1} exercicio={exercicio} respostas={lista} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

function ErrosDoExercicio({ numero, exercicio, respostas }: { numero: number; exercicio: Exercicio; respostas: Resposta[] }) {
  return (
    <div>
      <h3 className="font-bold">
        {numero}. {exercicio.titulo}
      </h3>
      <ul className="mt-2 divide-y divide-linha">
        {exercicio.itens.map((item) => {
          const erradas = respostas.filter((r) => r.item_id === item.id && r.status === "errado");
          const contagem = new Map<string, number>();
          for (const r of erradas) {
            const chave = item.tipo === "lacuna" ? normalizarBasico(r.valor) : r.valor;
            contagem.set(chave, (contagem.get(chave) ?? 0) + 1);
          }
          const ordenadas = [...contagem.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

          return (
            <li key={item.id} className="py-2.5 text-sm">
              <p>{item.enunciado}</p>
              {ordenadas.length > 0 ? (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {ordenadas.map(([valor, vezes]) => {
                    const { texto, prevista } =
                      item.tipo === "lacuna"
                        ? {
                            texto: valor,
                            prevista: item.errosPrevistos.some((e) => normalizarBasico(e.valor) === valor),
                          }
                        : (() => {
                            const alt = item.alternativas.find((a) => a.id === valor);
                            return { texto: alt?.texto ?? "?", prevista: Boolean(alt?.explicacao) };
                          })();
                    return (
                      <span
                        key={valor}
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${prevista ? "bg-erro-fundo text-erro" : "bg-aviso-fundo text-aviso"}`}
                        title={prevista ? "Erro previsto" : "Sem explicação própria"}
                      >
                        {texto} ×{vezes}
                        {prevista ? "" : " · não previsto"}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-1 text-xs text-tinta-suave">Nenhum erro registrado.</p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
