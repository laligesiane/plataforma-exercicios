-- Corrige "Nova atividade": o Supabase lê a linha recém-criada e a regra de leitura
-- (pode_ver_atividade) ainda não a enxergava. O dono passa a ver as próprias atividades direto.
-- Rodar uma vez no SQL Editor do Supabase, depois da 0003.

drop policy if exists "ver atividade" on public.atividade;
drop policy if exists "professor vê suas atividades" on public.atividade;
drop policy if exists "ver atividade publicada" on public.atividade;

create policy "professor vê suas atividades" on public.atividade for select
  using (professor_id = (select auth.uid()));

create policy "ver atividade publicada" on public.atividade for select
  using (publicada and public.pode_ver_atividade(id));
