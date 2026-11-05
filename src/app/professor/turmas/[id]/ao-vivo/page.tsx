import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Cabecalho } from "@/components/Cabecalho";
import { botaoSecundario, campo } from "@/components/ui/estilos";
import { ehAutomatico, ehUuid, type Exercicio } from "@/lib/atividades/modelo";
import { textoDoItem } from "@/lib/atividades/resumo";
import { painelAoVivo, type RespostaAoVivo } from "@/lib/aovivo";
import { exigirPapel } from "@/lib/perfil";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { AtualizarSozinho } from "./AtualizarSozinho";

export const metadata: Metadata = { title: "Aula ao vivo · Repasa" };

type Aluno = { id: string; nome: string | null; email: string };
type Busca = { atividade?: string; desde?: string; tela?: string };

const porcento = (parte: number, total: number) => (total ? Math.round((parte / total) * 100) : 0);

export default async function AulaAoVivo({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Busca> }) {
  const { id } = await params;
  const busca = await searchParams;
  if (!ehUuid(id)) notFound();
  await exigirPapel("professor");
  const supabase = await criarClienteServidor();

  const [{ data: turma }, { data: atribuicoes }] = await Promise.all([
    supabase.from("turma").select("id, nome, turma_aluno(perfil(id, nome, email))").eq("id", id).maybeSingle(),
    supabase.from("atividade_turma").select("ordem, atividade(id, titulo, publicada)").eq("turma_id", id).order("ordem"),
  ]);
  if (!turma) notFound();

  const alunos = turma.turma_aluno.flatMap((m) => (m.perfil ? [m.perfil as unknown as Aluno] : []));
  const publicadas = (atribuicoes ?? [])
    .flatMap((a) => (a.atividade ? [a.atividade as unknown as { id: string; titulo: string; publicada: boolean }] : []))
    .filter((a) => a.publicada);
  // "Começar agora" manda desde=agora; a hora certa é a do clique, não a de quando a página abriu.
  if (busca.desde === "agora" && busca.atividade) {
    redirect(`/professor/turmas/${id}/ao-vivo?${new URLSearchParams({ atividade: busca.atividade, desde: new Date().toISOString() })}`);
  }
  const atual = publicadas.find((a) => a.id === busca.atividade) ?? null;
  const desde = busca.desde && !Number.isNaN(Date.parse(busca.desde)) ? new Date(busca.desde).toISOString() : null;
  const naTela = busca.tela === "1";
  const base = `/professor/turmas/${id}/ao-vivo`;
  const link = (mudar: Partial<Busca>) => {
    const p = new URLSearchParams();
    const tudo = { atividade: atual?.id, desde: desde ?? undefined, tela: naTela ? "1" : undefined, ...mudar };
    for (const [k, v] of Object.entries(tudo)) if (v) p.set(k, v);
    return `${base}?${p}`;
  };

  let painel: ReturnType<typeof painelAoVivo> | null = null;
  let itens: { id: string; texto: string; exercicio: string }[] = [];
  if (atual) {
    let consulta = supabase.from("resposta").select("aluno_id, item_id, status, criada_em").eq("atividade_id", atual.id);
    if (desde) consulta = consulta.gte("criada_em", desde);
    const [{ data: exerciciosDb }, { data: respostas }] = await Promise.all([
      supabase.from("exercicio").select("id, tipo, titulo, instrucoes, itens, config, ordem").eq("atividade_id", atual.id).order("ordem"),
      consulta,
    ]);
    const exercicios = (exerciciosDb ?? []).map(({ config, ...resto }) => ({ ...(config ?? {}), ...resto }) as Exercicio);
    itens = exercicios.filter(ehAutomatico).flatMap((e, n) =>
      (e.itens as Parameters<typeof textoDoItem>[0][]).map((i) => ({ id: i.id, texto: textoDoItem(i), exercicio: e.titulo || `Exercício ${n + 1}` })),
    );
    painel = painelAoVivo(
      alunos.map((a) => a.id),
      itens.map((i) => i.id),
      (respostas ?? []) as RespostaAoVivo[],
    );
  }
  const nome = new Map(alunos.map((a) => [a.id, a.nome || a.email]));

  return (
    <>
      {!naTela && <Cabecalho />}
      <main className={`mx-auto w-full px-4 pt-8 pb-16 ${naTela ? "max-w-6xl text-lg" : "max-w-4xl"}`}>
        {!naTela && (
          <Link href={`/professor/turmas/${id}`} className="text-sm font-bold text-primaria hover:underline">
            ← {turma.nome}
          </Link>
        )}
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">{atual ? atual.titulo : "Aula ao vivo"}</h1>
            <p className="mt-1 text-tinta-suave">
              {turma.nome}
              {desde && ` · respostas desde ${new Date(desde).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" })}`}
            </p>
          </div>
          {atual && <AtualizarSozinho />}
        </div>

        {!naTela && (
          <form action={base} className="mt-6 flex flex-wrap gap-2">
            <select name="atividade" defaultValue={atual?.id ?? ""} aria-label="Atividade" required className={`${campo} sm:w-auto sm:flex-1`}>
              <option value="" disabled>
                Escolha a atividade da aula
              </option>
              {publicadas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.titulo}
                </option>
              ))}
            </select>
            <input type="hidden" name="desde" value="agora" />
            <button type="submit" className={botaoSecundario}>
              Começar agora
            </button>
          </form>
        )}
        {!naTela && !atual && (
          <p className="mt-4 text-sm text-tinta-suave">
            Escolha uma atividade publicada e peça para a turma abrir. Você vê quem já está respondendo e onde a turma está errando, atualizando
            sozinho a cada 5 segundos. Só contam as respostas a partir de quando você clicar em &quot;Começar agora&quot;.
            {publicadas.length === 0 && " Esta turma ainda não tem atividades publicadas."}
          </p>
        )}

        {atual && painel && (
          <>
            <div className="mt-6 grid grid-cols-3 gap-3">
              <Numero valor={painel.ativos} de={alunos.length} rotulo="respondendo agora" />
              <Numero valor={painel.porAluno.filter((a) => a.respondidos > 0).length} de={alunos.length} rotulo="já começaram" />
              <Numero valor={painel.terminaram} de={alunos.length} rotulo="terminaram" />
            </div>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <Link href={link({ tela: naTela ? undefined : "1" })} className="font-bold text-primaria hover:underline">
                {naTela ? "Sair da tela da turma" : "Mostrar na tela da turma (sem nomes)"}
              </Link>
              {!naTela && (
                <Link href={link({ desde: "agora" })} prefetch={false} className="font-bold text-primaria hover:underline">
                  Zerar a partir de agora
                </Link>
              )}
            </div>

            <section className="mt-6 rounded-2xl border border-linha p-5 sm:p-6">
              <h2 className="text-lg font-bold">Item por item</h2>
              <p className="mt-1 text-sm text-tinta-suave">A barra mostra quantos acertaram de primeira entre os que já responderam.</p>
              {itens.length === 0 ? (
                <p className="mt-3 text-sm text-tinta-suave">Esta atividade não tem itens com correção automática.</p>
              ) : (
                <ol className="mt-4 space-y-4">
                  {itens.map((item, n) => {
                    const p = painel.porItem[n];
                    const pct = porcento(p.deCara, p.responderam);
                    const alerta = p.responderam >= 2 && pct < 50;
                    return (
                      <li key={item.id}>
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="min-w-0">
                            <span className="mr-2 text-tinta-suave tabular-nums">{n + 1}.</span>
                            <span className="font-semibold">{item.texto}</span>
                            {alerta && <span className="ml-2 rounded-full bg-erro-fundo px-2 py-0.5 text-xs font-bold text-erro">Vale explicar</span>}
                          </span>
                          <span className="shrink-0 text-sm text-tinta-suave tabular-nums">
                            {p.responderam ? `${pct}% de ${p.responderam}` : "ninguém ainda"}
                          </span>
                        </div>
                        <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-suave" aria-hidden>
                          <div className={`h-full rounded-full ${alerta ? "bg-erro" : "bg-primaria"}`} style={{ width: `${pct}%` }} />
                        </div>
                        {!naTela && p.aindaErrados.length > 0 && (
                          <p className="mt-1 text-xs text-tinta-suave">Ainda errando: {p.aindaErrados.map((a) => nome.get(a)).join(", ")}</p>
                        )}
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>

            {!naTela && (
              <section className="mt-6 rounded-2xl border border-linha p-5 sm:p-6">
                <h2 className="text-lg font-bold">Alunos</h2>
                {alunos.length === 0 ? (
                  <p className="mt-3 text-sm text-tinta-suave">A turma ainda não tem alunos.</p>
                ) : (
                  <ul className="mt-4 divide-y divide-linha">
                    {[...painel.porAluno]
                      .sort((a, b) => Number(b.ativo) - Number(a.ativo) || b.respondidos - a.respondidos)
                      .map((a) => (
                        <li key={a.alunoId} className="flex items-center gap-3 py-2.5 text-sm">
                          <span aria-hidden className={`size-2.5 shrink-0 rounded-full ${a.ativo ? "bg-primaria" : "bg-linha"}`} />
                          <span className="min-w-0 flex-1 truncate font-semibold">{nome.get(a.alunoId)}</span>
                          <span className="w-24 shrink-0 sm:w-40">
                            <span className="block h-2 overflow-hidden rounded-full bg-suave" aria-hidden>
                              <span className="block h-full rounded-full bg-primaria" style={{ width: `${porcento(a.respondidos, itens.length)}%` }} />
                            </span>
                          </span>
                          <span className="w-20 shrink-0 text-right text-tinta-suave tabular-nums">
                            {a.respondidos}/{itens.length}
                            <span className="sr-only">{a.ativo ? ", respondendo agora" : ""}</span>
                          </span>
                        </li>
                      ))}
                  </ul>
                )}
              </section>
            )}
          </>
        )}
      </main>
    </>
  );
}

function Numero({ valor, de, rotulo }: { valor: number; de: number; rotulo: string }) {
  return (
    <div className="rounded-2xl border border-linha p-4 text-center">
      <p className="text-3xl font-extrabold tabular-nums">
        {valor}
        <span className="text-base font-bold text-tinta-suave">/{de}</span>
      </p>
      <p className="mt-1 text-xs font-bold tracking-wide text-tinta-suave uppercase">{rotulo}</p>
    </div>
  );
}
