import { gerarIcs, type EventoTurma, type EventoUnico } from "@/lib/agenda/ics";
import { camposCompromisso, eventoDoCompromisso, type Compromisso } from "@/lib/compromissos";
import { camposDataTurma, eventoDaDataTurma, type DataTurma } from "@/lib/importar-calendario";
import { criarClienteAdmin } from "@/lib/supabase/admin";

// Assinatura .ics: o Google Agenda busca este endereço sem login, então o token secreto é a chave.
export async function GET(_req: Request, { params }: { params: Promise<{ arquivo: string }> }) {
  const { arquivo } = await params;
  const token = arquivo.replace(/\.ics$/, "");
  if (!/^[0-9a-f-]{36}$/i.test(token)) return new Response("Não encontrado", { status: 404 });

  const admin = criarClienteAdmin();
  const { data: perfil } = await admin.from("perfil").select("id, papel").eq("agenda_token", token).maybeSingle();
  if (!perfil) return new Response("Não encontrado", { status: 404 });

  let turmaIds: string[];
  if (perfil.papel === "professor") {
    const { data } = await admin.from("turma").select("id").eq("professor_id", perfil.id);
    turmaIds = (data ?? []).map((t) => t.id);
  } else {
    const { data } = await admin.from("turma_aluno").select("turma_id").eq("aluno_id", perfil.id);
    turmaIds = (data ?? []).map((t) => t.turma_id);
  }

  const { data: horarios } = turmaIds.length
    ? await admin
        .from("turma_horario")
        .select("id, dia_semana, hora_inicio, duracao_min, fuso, turma(nome)")
        .in("turma_id", turmaIds)
    : { data: [] };

  const eventos: EventoTurma[] = (horarios ?? []).map((h) => ({
    ...h,
    turma_nome: (h.turma as unknown as { nome: string } | null)?.nome ?? "Aula",
  }));

  // Agenda pessoal do aluno: tarefas, provas e aulas de fora da Repasa.
  let compromissos: Compromisso[] = [];
  if (perfil.papel === "aluno") {
    const { data } = await admin.from("compromisso").select(camposCompromisso).eq("aluno_id", perfil.id);
    compromissos = (data ?? []) as Compromisso[];
  }

  // Prazos das atividades das turmas: o aluno vê os que ainda não enviou; o professor, todos.
  const prazos: EventoUnico[] = [];
  if (turmaIds.length) {
    const { data: atribuicoes } = await admin
      .from("atividade_turma")
      .select("turma(nome), atividade(id, titulo, prazo, publicada)")
      .in("turma_id", turmaIds)
      .not("atividade.prazo", "is", null);
    let enviadas = new Set<string>();
    if (perfil.papel === "aluno") {
      const { data: envios } = await admin.from("envio").select("atividade_id").eq("aluno_id", perfil.id);
      enviadas = new Set((envios ?? []).map((e) => e.atividade_id as string));
    }
    type Linha = { turma: { nome: string } | null; atividade: { id: string; titulo: string; prazo: string | null; publicada: boolean } | null };
    for (const a of (atribuicoes ?? []) as unknown as Linha[]) {
      if (!a.atividade?.prazo || !a.atividade.publicada || enviadas.has(a.atividade.id)) continue;
      prazos.push({
        id: `prazo-${a.atividade.id}-${a.turma?.nome ?? ""}`,
        titulo: `Entregar: ${a.atividade.titulo}${a.turma ? ` (${a.turma.nome})` : ""}`,
        descricao: "Atividade na Repasa",
        data: a.atividade.prazo,
      });
    }
  }

  // Calendário das turmas (provas, feriados, férias) que o professor importou.
  const datasTurma: EventoUnico[] = [];
  if (turmaIds.length) {
    const { data } = await admin.from("data_turma").select(`${camposDataTurma}, turma(nome)`).in("turma_id", turmaIds);
    for (const d of (data ?? []) as unknown as (DataTurma & { turma: { nome: string } | null })[]) {
      datasTurma.push(eventoDaDataTurma(d, d.turma?.nome ?? "Turma"));
    }
  }

  const nome = perfil.papel === "aluno" ? "Minha agenda na Repasa" : "Aulas na Repasa";
  return new Response(gerarIcs(eventos, nome, new Date(), [...compromissos.map(eventoDoCompromisso), ...prazos, ...datasTurma]), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="repasa.ics"',
      "Cache-Control": "private, max-age=900",
    },
  });
}
