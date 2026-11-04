import Link from "next/link";
import { proximaAula, type Horario } from "@/lib/agenda";
import { formatarData, hojeNoFuso, tituloAula } from "@/lib/aulas";
import { proximasAulas, temMapa } from "@/lib/pedidos";
import { exigirPapel } from "@/lib/perfil";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { CartaoMateria } from "./CartaoMateria";
import { carregarResumosDoAluno } from "./dados";
import { LayoutConta } from "./LayoutConta";

const formatoDia = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

export default async function MinhaConta() {
  const perfil = await exigirPapel("aluno");
  const supabase = await criarClienteServidor();
  const hoje = hojeNoFuso();

  const [{ data: turmas }, { data: atribuicoes }, { data: respostas }, { data: horarios }, { data: aulasDb }, { data: materias }, { count: pendentes }, resumos] =
    await Promise.all([
      supabase.from("turma").select("id, nome"),
      supabase.from("atividade_turma").select("atividade(id)"),
      supabase.from("resposta").select("atividade_id").eq("aluno_id", perfil.id),
      supabase.from("turma_horario").select("turma_id, dia_semana, hora_inicio, duracao_min, fuso"),
      supabase.from("aula").select("id, turma_id, data, titulo").gte("data", hoje).order("data"),
      supabase.from("materia").select("id, nome, cor, resumo(count)").order("criada_em"),
      supabase.from("pedido_aula").select("id", { count: "exact", head: true }).eq("aluno_id", perfil.id).eq("status", "pendente"),
      carregarResumosDoAluno(),
    ]);

  const nomeTurma = new Map((turmas ?? []).map((t) => [t.id, t.nome]));
  const atividades = new Set((atribuicoes ?? []).flatMap((a) => (a.atividade ? [(a.atividade as unknown as { id: string }).id] : [])));
  const comecadas = new Set((respostas ?? []).map((r) => r.atividade_id).filter((id) => atividades.has(id)));
  const novas = atividades.size - comecadas.size;
  const mapas = resumos.filter(temMapa);

  // Próximo compromisso: a aula marcada mais próxima ou o próximo horário semanal.
  const aulaMarcada = proximasAulas(aulasDb ?? [], hoje)[0] ?? null;
  const semanal = proximaAula((horarios ?? []) as (Horario & { turma_id: string })[]);
  const semanalData = semanal && `${semanal.ano}-${String(semanal.mes).padStart(2, "0")}-${String(semanal.dia).padStart(2, "0")}`;
  const proxima =
    aulaMarcada && (!semanalData || aulaMarcada.data <= semanalData)
      ? {
          quando: aulaMarcada.data === hoje ? "Hoje" : formatarData(aulaMarcada.data),
          oque: `${tituloAula(aulaMarcada)} · ${nomeTurma.get(aulaMarcada.turma_id) ?? ""}`,
        }
      : semanal
        ? {
            quando: `${formatoDia.format(new Date(Date.UTC(semanal.ano, semanal.mes - 1, semanal.dia)))} às ${semanal.horario.hora_inicio.slice(0, 5)}`,
            oque: nomeTurma.get((semanal.horario as Horario & { turma_id: string }).turma_id) ?? "Aula da turma",
          }
        : null;

  const atalhos = [
    {
      href: "/aluno/atividades",
      titulo: "Atividades",
      numero: atividades.size,
      detalhe: atividades.size === 0 ? "Nenhuma ainda" : novas > 0 ? `${novas} ${novas === 1 ? "nova" : "novas"}` : "Todas começadas",
    },
    { href: "/aluno/materias", titulo: "Matérias", numero: (materias ?? []).length, detalhe: "Plano grátis: até 3" },
    { href: "/aluno/resumos", titulo: "Resumos", numero: resumos.length, detalhe: "Seus e das turmas" },
    { href: "/aluno/mapas", titulo: "Mapas mentais", numero: mapas.length, detalhe: "Para revisar de relance" },
  ];

  return (
    <LayoutConta titulo={`Olá${perfil.nome ? `, ${perfil.nome}` : ""}!`} descricao="Tudo do seu estudo num lugar só.">
      <section className="mt-8 rounded-2xl bg-primaria-suave p-5 sm:p-6">
        <h2 className="text-sm font-bold tracking-wide text-primaria uppercase">Agenda</h2>
        {proxima ? (
          <>
            <p className="mt-2 text-xl font-extrabold first-letter:uppercase">{proxima.quando}</p>
            <p className="mt-0.5 text-tinta-suave">{proxima.oque}</p>
          </>
        ) : (
          <p className="mt-2 text-xl font-extrabold">Nenhuma aula marcada</p>
        )}
        {(pendentes ?? 0) > 0 && (
          <p className="mt-2 text-sm font-semibold text-tinta-suave">
            {pendentes} {pendentes === 1 ? "pedido de aula aguardando" : "pedidos de aula aguardando"} o professor
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-4">
          <Link href="/aluno/agenda" className="text-sm font-bold text-primaria hover:underline">
            Ver agenda
          </Link>
          {(turmas ?? []).length > 0 && (
            <Link href="/aluno/agenda#marcar" className="text-sm font-bold text-primaria hover:underline">
              Marcar uma aula
            </Link>
          )}
        </div>
      </section>

      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
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
            <h2 className="text-lg font-bold">Minhas matérias</h2>
            <Link href="/aluno/materias" className="text-sm font-bold text-primaria hover:underline">
              Ver todas
            </Link>
          </div>
          <ul className="mt-3 grid gap-3 sm:grid-cols-3">
            {(materias ?? []).map((m) => (
              <li key={m.id}>
                <CartaoMateria id={m.id} nome={m.nome} cor={m.cor} total={(m.resumo as unknown as { count: number }[])[0]?.count ?? 0} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {resumos.length > 0 && (
        <section className="mt-8">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-bold">Resumos recentes</h2>
            <Link href="/aluno/resumos" className="text-sm font-bold text-primaria hover:underline">
              Ver todos
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
          <p className="font-semibold">Comece criando uma matéria.</p>
          <p className="mt-1 text-sm text-tinta-suave">Nela você guarda resumos e mapas mentais. Se tiver professor, peça o convite da turma.</p>
          <div className="mt-3 flex flex-wrap justify-center gap-4">
            <Link href="/aluno/materias" className="text-sm font-bold text-primaria hover:underline">
              Criar matéria
            </Link>
            <Link href="/experimente" className="text-sm font-bold text-primaria hover:underline">
              Experimentar a aula de demonstração
            </Link>
          </div>
        </div>
      )}
    </LayoutConta>
  );
}
