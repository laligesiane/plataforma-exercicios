-- Agenda: link secreto de assinatura (.ics) e edição dos horários. Quem tem o link vê só os horários das turmas da pessoa.
-- Rodar uma vez no SQL Editor do Supabase, depois da 0010.

alter table public.perfil add column agenda_token uuid not null default gen_random_uuid() unique;

-- Professor edita os horários das suas turmas.
create policy "professor edita horários" on public.turma_horario for update
  using (public.eh_professor_da_turma(turma_id))
  with check (public.eh_professor_da_turma(turma_id));
