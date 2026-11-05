import { gerarIcs, type EventoTurma } from "@/lib/agenda/ics";
import { camposCompromisso, eventoDoCompromisso, type Compromisso } from "@/lib/compromissos";
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

  const nome = perfil.papel === "aluno" ? "Minha agenda na Repasa" : "Aulas na Repasa";
  return new Response(gerarIcs(eventos, nome, new Date(), compromissos.map(eventoDoCompromisso)), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="repasa.ics"',
      "Cache-Control": "private, max-age=900",
    },
  });
}
