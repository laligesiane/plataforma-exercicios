-- Professor edita os horários das suas turmas (dia, início e duração).
-- Rodar uma vez no SQL Editor do Supabase, depois da 0012.

create policy "professor edita horários" on public.turma_horario for update
  using (public.eh_professor_da_turma(turma_id))
  with check (public.eh_professor_da_turma(turma_id));
