import { LANG_HTML, fmt } from "@/i18n/config";
import { obterDicionario, obterIdioma } from "@/i18n/servidor";
import Link from "next/link";
import { AssinarAgenda } from "@/components/AssinarAgenda";
import { BotaoExcluir } from "@/components/BotaoExcluir";
import { HorariosTurma } from "@/components/HorariosTurma";
import type { Horario } from "@/lib/agenda";
import { camposAula, formatarData, hojeNoFuso, tituloAula, type Aula } from "@/lib/aulas";
import { camposCompromisso, separarCompromissos, type Compromisso } from "@/lib/compromissos";
import { camposPedido, proximasAulas, separarPedidos, type PedidoAula } from "@/lib/pedidos";
import { exigirPapel } from "@/lib/perfil";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { LayoutConta } from "../LayoutConta";
import { cancelarPedido, importarCompromissos } from "./actions";
import { FormularioCompromisso } from "./FormularioCompromisso";
import { FormularioPedido } from "./FormularioPedido";
import { ListaCompromissos } from "./ListaCompromissos";
import { ImportarCalendario } from "@/components/ImportarCalendario";
import { camposDataTurma, datasPelaFrente, quandoTexto, somarDias, type DataTurma } from "@/lib/importar-calendario";

const corStatus = {
  pendente: "bg-suave text-tinta-suave",
  aceito: "bg-certo-fundo text-certo",
  recusado: "bg-erro-fundo text-erro",
} as const;

export default async function AgendaDoAluno() {
  const perfil = await exigirPapel("aluno");
  const supabase = await criarClienteServidor();
  const hoje = hojeNoFuso();
  const [d, idioma] = await Promise.all([obterDicionario(), obterIdioma()]);
  const tx = d.agenda;
  const locale = LANG_HTML[idioma];

  const [{ data: turmas }, { data: horarios }, { data: aulasDb }, { data: pedidosDb }, { data: compromissosDb }, { data: datasDb }] = await Promise.all([
    supabase.from("turma").select("id, nome").order("nome"),
    supabase.from("turma_horario").select("id, turma_id, dia_semana, hora_inicio, duracao_min, fuso"),
    supabase.from("aula").select(camposAula).gte("data", hoje).order("data"),
    supabase.from("pedido_aula").select(camposPedido).eq("aluno_id", perfil.id).order("data"),
    supabase.from("compromisso").select(camposCompromisso).eq("aluno_id", perfil.id).order("data"),
    supabase.from("data_turma").select(camposDataTurma).gte("data", somarDias(hoje, -120)).order("data"),
  ]);
  const datasTurmas = datasPelaFrente((datasDb ?? []) as DataTurma[], hoje);
  const compromissos = separarCompromissos((compromissosDb ?? []) as Compromisso[], hoje);
  const listaTurmas = turmas ?? [];
  const nomeTurma = new Map(listaTurmas.map((t) => [t.id, t.nome]));
  const aulas = proximasAulas((aulasDb ?? []) as Aula[], hoje);
  const { ativos, passados } = separarPedidos((pedidosDb ?? []) as PedidoAula[], hoje);
  const pendentes = ativos.filter((p) => p.status === "pendente");

  const horariosPorTurma = new Map<string, (Horario & { id: string })[]>();
  for (const h of horarios ?? []) horariosPorTurma.set(h.turma_id, [...(horariosPorTurma.get(h.turma_id) ?? []), h]);

  return (
    <LayoutConta titulo={tx.titulo} descricao={tx.descricao}>
      <section className="mt-8">
        <h2 className="text-lg font-bold">{tx.compromissos}</h2>
        <p className="mt-1 text-sm text-tinta-suave">
          {tx.compromissosTexto}
        </p>
        <details open={compromissos.pelaFrente.length === 0} className="mt-3 rounded-2xl border border-linha p-5 sm:p-6">
          <summary className="cursor-pointer font-bold text-primaria">{tx.adicionarCompromisso}</summary>
          <div className="mt-4">
            <FormularioCompromisso hoje={hoje} />
          </div>
        </details>
        <details className="mt-3 rounded-2xl border border-linha p-5 sm:p-6">
          <summary className="cursor-pointer font-bold text-primaria">{tx.importar}</summary>
          <div className="mt-4">
            <ImportarCalendario
              hoje={hoje}
              existentes={(compromissosDb ?? []) as Compromisso[]}
              salvar={importarCompromissos}
              ondeSalva={tx.ondeSalva}
              pedirMateria
            />
          </div>
        </details>
        {compromissos.pelaFrente.length > 0 && (
          <div className="mt-4">
            <ListaCompromissos itens={compromissos.pelaFrente} hoje={hoje} />
          </div>
        )}
        {compromissos.passados.length > 0 && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-bold text-tinta-suave">
              {fmt(tx.jaFeitos, { n: compromissos.passados.length })}
            </summary>
            <div className="mt-3">
              <ListaCompromissos itens={compromissos.passados} hoje={hoje} />
            </div>
          </details>
        )}
      </section>

      <div className="mt-6">
        <AssinarAgenda
          perfilId={perfil.id}
          titulo={tx.assinarTitulo}
          descricao={tx.assinarTexto}
        />
      </div>

      {datasTurmas.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold">{tx.datasTurmas}</h2>
          <p className="mt-1 text-sm text-tinta-suave">{tx.datasTurmasTexto}</p>
          <ul className="mt-3 divide-y divide-linha rounded-2xl border border-linha">
            {datasTurmas.map((dt) => (
              <li key={dt.id} className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-3.5">
                <span>
                  <span className="block font-bold">{dt.titulo}</span>
                  <span className="text-sm text-tinta-suave">
                    {d.datas.tiposCalendario[dt.tipo]} · {nomeTurma.get(dt.turma_id)}
                  </span>
                </span>
                <span className="text-sm font-semibold text-primaria">{quandoTexto(dt)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-bold">{tx.proximasAulas}</h2>
        {aulas.length > 0 ? (
          <ul className="mt-3 divide-y divide-linha rounded-2xl border border-linha">
            {aulas.map((a) => (
              <li key={a.id} className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-3.5">
                <span>
                  <span className="block font-bold">{tituloAula(a, d.datas, locale)}</span>
                  <span className="text-sm text-tinta-suave">{nomeTurma.get(a.turma_id)}</span>
                </span>
                <span className="text-sm font-semibold text-primaria">{a.data === hoje ? d.datas.hoje : formatarData(a.data, locale)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 rounded-2xl border border-dashed border-linha p-5 text-sm text-tinta-suave">
            {tx.nenhumaAula}
          </p>
        )}
      </section>

      {listaTurmas.some((t) => (horariosPorTurma.get(t.id) ?? []).length > 0) && (
        <section className="mt-8">
          <h2 className="text-lg font-bold">{tx.todaSemana}</h2>
          <div className="mt-3 space-y-5">
            {listaTurmas.map((t) =>
              (horariosPorTurma.get(t.id) ?? []).length > 0 ? (
                <div key={t.id} className="rounded-2xl border border-linha p-5">
                  <h3 className="mb-3 font-bold">{t.nome}</h3>
                  <HorariosTurma horarios={horariosPorTurma.get(t.id) ?? []} nomeTurma={t.nome} />
                </div>
              ) : null,
            )}
          </div>
        </section>
      )}

      <section id="marcar" className="mt-8 scroll-mt-6">
        <h2 className="text-lg font-bold">{tx.marcar}</h2>
        {listaTurmas.length > 0 ? (
          <div className="mt-3 rounded-2xl border border-linha p-5 sm:p-6">
            <p className="mb-4 text-sm text-tinta-suave">
              {tx.marcarTexto}
            </p>
            <FormularioPedido turmas={listaTurmas} hoje={hoje} />
          </div>
        ) : (
          <div className="mt-3 rounded-2xl border border-dashed border-linha p-5 text-sm text-tinta-suave">
            <p>{tx.semTurma}</p>
            <Link href="/experimente" className="mt-2 inline-block font-bold text-primaria hover:underline">
              {tx.experimente}
            </Link>
          </div>
        )}
      </section>

      {ativos.length + passados.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold">
            {tx.pedidos}
            {pendentes.length > 0 && <span className="text-tinta-suave">{fmt(tx.aguardando, { n: pendentes.length })}</span>}
          </h2>
          <ul className="mt-3 divide-y divide-linha rounded-2xl border border-linha">
            {[...ativos, ...passados].map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                <span>
                  <span className="block font-bold">
                    {formatarData(p.data, locale)}
                    {p.hora && fmt(tx.as, { hora: p.hora.slice(0, 5) })}
                  </span>
                  <span className="text-sm text-tinta-suave">
                    {nomeTurma.get(p.turma_id)}
                    {p.mensagem && ` · ${p.mensagem}`}
                  </span>
                </span>
                <span className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${corStatus[p.status]}`}>{tx.status[p.status]}</span>
                  {p.status === "pendente" && (
                    <BotaoExcluir
                      acao={cancelarPedido}
                      campos={{ id: p.id }}
                      rotulo={d.comum.cancelar}
                      pergunta={tx.cancelarPedido}
                      discreto
                    />
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </LayoutConta>
  );
}
