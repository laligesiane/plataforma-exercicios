-- Calendário da turma: datas que o professor importa do calendário acadêmico (provas, entregas,
-- feriados, férias) depois de revisar. Os alunos da turma veem na agenda e no link de assinatura.
-- Rodar uma vez no SQL Editor do Supabase ANTES do merge.

create table public.data_turma (
  id uuid primary key default gen_random_uuid(),
  turma_id uuid not null references public.turma (id) on delete cascade,
  tipo text not null default 'outro' check (tipo in ('prova', 'entrega', 'aula', 'sem_aula', 'outro')),
  titulo text not null check (btrim(titulo) <> '' and char_length(titulo) <= 200),
  data date not null,
  ate date check (ate is null or ate > data),
  hora time,
  criado_em timestamptz not null default now()
);

create index on public.data_turma (turma_id, data);

alter table public.data_turma enable row level security;

-- As funções consultam turma/turma_aluno, não esta tabela, então o insert(...).select() relê a linha nova.
create policy "professor vê datas das suas turmas" on public.data_turma for select
  using (public.eh_professor_da_turma(turma_id));

create policy "aluno vê datas das suas turmas" on public.data_turma for select
  using (public.eh_aluno_da_turma(turma_id));

create policy "professor cria datas" on public.data_turma for insert
  with check (public.eh_professor_da_turma(turma_id));

create policy "professor edita datas" on public.data_turma for update
  using (public.eh_professor_da_turma(turma_id))
  with check (public.eh_professor_da_turma(turma_id));

create policy "professor apaga datas" on public.data_turma for delete
  using (public.eh_professor_da_turma(turma_id));
