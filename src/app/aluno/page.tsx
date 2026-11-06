import { LANG_HTML, fmt } from "@/i18n/config";
import { obterDicionario, obterIdioma } from "@/i18n/servidor";
import Link from "next/link";
import { proximaAula, type Horario } from "@/lib/agenda";
import { formatarData, hojeNoFuso, tituloAula } from "@/lib/aulas";
import { proximasAulas, temMapa } from "@/lib/pedidos";
import { exigirPapel } from "@/lib/perfil";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { montarParaFazer, rotuloPrazo, type CompromissoAluno } from "@/lib/parafazer";
import { diasDeEstudo } from "@/lib/sequencia";
import { continuarDeOndeParou } from "@/lib/continuar";
import { agendaDeHoje } from "@/lib/hoje";
import { camposDataTurma, somarDias, type DataTurma } from "@/lib/importar-calendario";
import { AgendaHoje } from "./AgendaHoje";
import { CartaoCurso } from "./cursos/CartaoCurso";
import { carregarCursos, SEM_CURSO } from "./cursos/dados";
import { SequenciaBrotinho } from "./SequenciaBrotinho";
import { carregarResumosDoAluno } from "./dados";
import { LayoutConta } from "./LayoutConta";


export default async function MinhaConta() {
  const perfil = await exigirPapel("aluno");
  const supabase = await criarClienteServidor();
  const hoje = hojeNoFuso();
  const [d, idioma] = await Promise.all([obterDicionario(), obterIdioma()]);
  const tx = d.aluno;
  const locale = LANG_HTML[idioma];
  const formatoDia = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

  const [{ data: turmas }, { data: atribuicoes }, { data: respostas }, { data: horarios }, { data: aulasDb }, { data: materias }, { count: pendentes }, { count: paraRepassar }, { data: envios }, { data: compromissosDb }, { data: momentosResposta }, { data: momentosRevisao }, { data: datasDb }, resumos, meusCursos] =
    await Promise.all([
      supabase.from("turma").select("id, nome"),
      supabase.from("atividade_turma").select("turma(nome), atividade(id, titulo, prazo, publicada)"),
      supabase.from("resposta").select("atividade_id").eq("aluno_id", perfil.id),
      supabase.from("turma_horario").select("turma_id, dia_semana, hora_inicio, duracao_min, fuso"),
      supabase.from("aula").select("id, turma_id, data, titulo").gte("data", hoje).order("data"),
      supabase.from("materia").select("id, nome, cor, resumo(count)").order("criada_em"),
      supabase.from("pedido_aula").select("id", { count: "exact", head: true }).eq("aluno_id", perfil.id).eq("status", "pendente"),
      supabase
        .from("revisao")
        .select("id", { count: "exact", head: true })
        .eq("aluno_id", perfil.id)
        .is("concluida_em", null)
        .lte("proxima_em", hoje),
      supabase.from("envio").select("atividade_id").eq("aluno_id", perfil.id),
      supabase.from("compromisso").select("id, titulo, data, hora, feito, tipo, materia").eq("aluno_id", perfil.id).eq("feito", false),
      supabase
        .from("resposta")
        .select("criada_em, atividade_id")
        .eq("aluno_id", perfil.id)
        .gte("criada_em", new Date(Date.now() - 40 * 86_400_000).toISOString())
        .order("criada_em", { ascending: false })
        .limit(1000),
      supabase
        .from("revisao")
        .select("atualizada_em")
        .eq("aluno_id", perfil.id)
        .gte("atualizada_em", new Date(Date.now() - 40 * 86_400_000).toISOString()),
      // Períodos (férias, recesso) que começaram antes ainda contam hoje.
      supabase.from("data_turma").select(camposDataTurma).gte("data", somarDias(hoje, -120)).lte("data", hoje),
      carregarResumosDoAluno(),
      carregarCursos(),
    ]);

  const nomeTurma = new Map((turmas ?? []).map((t) => [t.id, t.nome]));
  type Atribuicao = { turma: { nome: string } | null; atividade: { id: string; titulo: string; prazo: string | null; publicada: boolean } | null };
  const atribuidas = ((atribuicoes ?? []) as unknown as Atribuicao[]).filter((a) => a.atividade?.publicada !== false);
  const atividades = new Set(atribuidas.flatMap((a) => (a.atividade ? [a.atividade.id] : [])));
  const porAtividade = new Map(
    atribuidas.flatMap((a) =>
      a.atividade ? [[a.atividade.id, { ...a.atividade, turma: a.turma?.nome ?? "" }] as const] : [],
    ),
  );
  const paraFazer = montarParaFazer(
    [...porAtividade.values()],
    new Set((envios ?? []).map((e) => e.atividade_id as string)),
    (compromissosDb ?? []) as CompromissoAluno[],
    d.datas,
  );
  const comecadas = new Set((respostas ?? []).map((r) => r.atividade_id).filter((id) => atividades.has(id)));
  const novas = atividades.size - comecadas.size;
  const mapas = resumos.filter(temMapa);
  // Conta como estudo: responder atividade, repassar erros e mexer nos próprios resumos.
  const diasEstudados = diasDeEstudo([
    ...(momentosResposta ?? []).map((r) => r.criada_em as string),
    ...(momentosRevisao ?? []).map((r) => r.atualizada_em as string),
    ...resumos.filter((r) => !r.turma_id).map((r) => r.atualizado_em),
  ]);

  // Próximo compromisso: a aula marcada mais próxima ou o próximo horário semanal.
  const aulaMarcada = proximasAulas(aulasDb ?? [], hoje)[0] ?? null;
  const semanal = proximaAula((horarios ?? []) as (Horario & { turma_id: string })[]);
  const semanalData = semanal && `${semanal.ano}-${String(semanal.mes).padStart(2, "0")}-${String(semanal.dia).padStart(2, "0")}`;
  const proxima =
    aulaMarcada && (!semanalData || aulaMarcada.data <= semanalData)
      ? {
          quando: aulaMarcada.data === hoje ? d.datas.hoje : formatarData(aulaMarcada.data, locale),
          oque: `${tituloAula(aulaMarcada, d.datas, locale)} · ${nomeTurma.get(aulaMarcada.turma_id) ?? ""}`,
        }
      : semanal
        ? {
            quando: fmt(d.datas.as, { data: formatoDia.format(new Date(Date.UTC(semanal.ano, semanal.mes - 1, semanal.dia))), hora: semanal.horario.hora_inicio.slice(0, 5) }),
            oque: nomeTurma.get((semanal.horario as Horario & { turma_id: string }).turma_id) ?? d.datas.aulaDaTurma,
          }
        : null;

  const itensHoje = agendaDeHoje({
    hoje,
    nomeTurma,
    aulas: aulasDb ?? [],
    horarios: horarios ?? [],
    atividades: [...porAtividade.values()],
    enviadas: new Set((envios ?? []).map((e) => e.atividade_id as string)),
    compromissos: (compromissosDb ?? []) as (CompromissoAluno & { hora: string | null })[],
    datasTurma: (datasDb ?? []) as DataTurma[],
    t: d.datas,
  });

  const continuar = continuarDeOndeParou(
    (momentosResposta ?? []) as { atividade_id: string; criada_em: string }[],
    porAtividade,
    new Set((envios ?? []).map((e) => e.atividade_id as string)),
    resumos,
  );

  const atalhos = [
    {
      href: "/aluno/atividades",
      titulo: tx.atividades,
      numero: atividades.size,
      detalhe: atividades.size === 0 ? tx.nenhumaAinda : novas > 0 ? (novas === 1 ? tx.nova1 : fmt(tx.novasN, { n: novas })) : tx.todasComecadas,
    },
    {
      href: "/aluno/cursos",
      titulo: tx.cursos,
      numero: (materias ?? []).length,
      detalhe: `${resumos.length === 1 ? tx.resumos1 : fmt(tx.resumosN, { n: resumos.length })} · ${mapas.length === 1 ? tx.mapas1 : fmt(tx.mapasN, { n: mapas.length })}`,
    },
  ];

  return (
    <LayoutConta titulo={perfil.nome ? fmt(tx.olaNome, { nome: perfil.nome }) : tx.ola} descricao={tx.descricao}>
      {continuar.length > 0 && (
        <section aria-label={tx.continuar} className="mt-8">
          <h2 className="text-sm font-bold tracking-wide text-tinta-suave uppercase">{tx.continuar}</h2>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {continuar.map((c) => (
              <li key={c.href}>
                <Link
                  href={c.href}
                  className="flex items-center justify-between gap-3 rounded-2xl border-2 border-linha p-4 transition-colors hover:border-primaria"
                >
                  <span className="min-w-0">
                    <span className="block text-xs font-bold text-primaria">{c.tipo === "Atividade" ? d.datas.atividade : d.datas.resumo}</span>
                    <span className="block truncate font-extrabold">{c.titulo}</span>
                  </span>
                  <span className="shrink-0 rounded-full bg-primaria px-3.5 py-1 text-sm font-bold text-white" aria-hidden>
                    {c.tipo === "Atividade" ? tx.botaoContinuar : tx.abrir}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <AgendaHoje
        className={continuar.length > 0 ? "mt-6" : "mt-8"}
        itens={itensHoje}
        proxima={proxima}
        pedidosAguardando={pendentes ?? 0}
        podeMarcar={(turmas ?? []).length > 0}
      />

      <SequenciaBrotinho dias={diasEstudados} hoje={hoje} />

      {paraFazer.length > 0 && (
        <section className="mt-6 rounded-2xl border border-linha p-5 sm:p-6">
          <h2 className="text-lg font-bold">{tx.paraFazer}</h2>
          <ul className="mt-2 divide-y divide-linha">
            {paraFazer.slice(0, 6).map((p) => {
              const prazo = rotuloPrazo(p.data, hoje, d.datas);
              return (
                <li key={p.chave}>
                  <Link href={p.href} className="flex items-baseline justify-between gap-4 py-2.5 hover:text-primaria">
                    <span className="min-w-0">
                      <span className="block font-semibold">{p.titulo}</span>
                      <span className="block text-sm text-tinta-suave">
                        {p.origem === "atividade" ? d.datas.atividade : d.datas.compromisso}
                        {p.detalhe ? ` · ${p.detalhe}` : ""}
                      </span>
                    </span>
                    {prazo && (
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${prazo.atrasado ? "bg-erro-fundo text-erro" : "bg-suave text-tinta-suave"}`}
                      >
                        {prazo.texto}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
          {paraFazer.length > 6 && <p className="mt-2 text-sm text-tinta-suave">{fmt(tx.eMais, { n: paraFazer.length - 6 })}</p>}
        </section>
      )}

      {(paraRepassar ?? 0) > 0 && (
        <Link
          href="/aluno/revisar"
          className="mt-6 flex items-center justify-between gap-4 rounded-2xl border-2 border-primaria p-4 transition-colors hover:bg-primaria-suave"
        >
          <span>
            <span className="block font-extrabold">{tx.repasarErros}</span>
            <span className="block text-sm text-tinta-suave">
              {paraRepassar === 1 ? tx.voltam1 : fmt(tx.voltamN, { n: paraRepassar ?? 0 })}
            </span>
          </span>
          <span className="shrink-0 rounded-full bg-primaria px-4 py-1.5 text-sm font-bold text-white">{tx.comecar}</span>
        </Link>
      )}

      <ul className="mt-6 grid grid-cols-2 gap-3">
        {atalhos.map((a) => (
          <li key={a.href}>
            <Link href={a.href} className="block h-full rounded-2xl border border-linha p-4 transition-colors hover:border-primaria">
              <span className="block text-3xl font-extrabold tabular-nums">{a.numero}</span>
              <span className="mt-1 block font-bold">{a.titulo}</span>
              <span className="block text-sm text-tinta-suave">{a.detalhe}</span>
            </Link>
          </li>
        ))}
      </ul>

      {(materias ?? []).length > 0 && (
        <section className="mt-8">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-bold">{tx.meusCursos}</h2>
            <Link href="/aluno/cursos" className="text-sm font-bold text-primaria hover:underline">
              {tx.verTodos}
            </Link>
          </div>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {meusCursos.cursos.map((c) => (
              <li key={c.id}>
                <CartaoCurso
                  href={`/aluno/cursos/${c.id}`}
                  nome={c.nome}
                  materias={c.materias.length}
                  resumos={c.resumos}
                  coresMaterias={c.materias.map((m) => m.cor)}
                  inicio={c.inicio}
                  duracaoMeses={c.duracao_meses}
                  etapa={c.etapa}
                />
              </li>
            ))}
            {meusCursos.semCurso.length > 0 && (
              <li>
                <CartaoCurso
                  href={`/aluno/cursos/${SEM_CURSO}`}
                  nome={tx.semCurso}
                  materias={meusCursos.semCurso.length}
                  resumos={meusCursos.resumosSemCurso}
                  coresMaterias={meusCursos.semCurso.map((m) => m.cor)}
                  discreto
                />
              </li>
            )}
          </ul>
        </section>
      )}

      {resumos.length > 0 && (
        <section className="mt-8">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-bold">{tx.resumosRecentes}</h2>
            <Link href="/aluno/cursos" className="text-sm font-bold text-primaria hover:underline">
              {tx.verTodos}
            </Link>
          </div>
          <ul className="mt-3 flex flex-wrap gap-2">
            {resumos.slice(0, 6).map((r) => (
              <li key={r.id}>
                <Link
                  href={`/aluno/resumos/${r.id}`}
                  className="inline-block rounded-full border border-linha px-3 py-1 text-sm font-bold hover:border-primaria hover:text-primaria"
                >
                  {r.titulo_exibido}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(materias ?? []).length === 0 && (turmas ?? []).length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-linha p-6 text-center">
          <p className="font-semibold">{tx.comeceCurso}</p>
          <p className="mt-1 text-sm text-tinta-suave">{tx.comeceCursoTexto}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-4">
            <Link href="/aluno/cursos" className="text-sm font-bold text-primaria hover:underline">
              {tx.criarCurso}
            </Link>
            <Link href="/experimente" className="text-sm font-bold text-primaria hover:underline">
              {tx.experimentarDemo}
            </Link>
          </div>
        </div>
      )}
    </LayoutConta>
  );
}
