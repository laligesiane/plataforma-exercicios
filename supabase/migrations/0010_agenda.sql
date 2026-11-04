-- Agenda: horário das aulas de cada turma (um registro por dia da semana) e link de assinatura.
-- Rodar uma vez no SQL Editor do Supabase, depois da 0004.

create table public.turma_horario (
  id uuid primary key default gen_random_uuid(),
  turma_id uuid not null references public.turma (id) on delete cascade,
  dia_semana smallint not null check (dia_semana between 0 and 6), -- 0 = domingo
  hora_inicio time not null,
  duracao_min smallint not null default 60 check (duracao_min between 15 and 480),
  fuso text not null default 'America/Sao_Paulo',
  criado_em timestamptz not null default now(),
  unique (turma_id, dia_semana, hora_inicio)
);

create index on public.turma_horario (turma_id);

alter table public.turma_horario enable row level security;

-- As funções consultam turma/turma_aluno, não esta tabela, então o insert(...).select() relê a linha nova.
create policy "professor vê horários das suas turmas" on public.turma_horario for select
  using (public.eh_professor_da_turma(turma_id));

create policy "aluno vê horários das suas turmas" on public.turma_horario for select
  using (public.eh_aluno_da_turma(turma_id));

create policy "professor cria horários" on public.turma_horario for insert
  with check (public.eh_professor_da_turma(turma_id));

create policy "professor apaga horários" on public.turma_horario for delete
  using (public.eh_professor_da_turma(turma_id));

-- Link secreto de assinatura da agenda (.ics). Quem tem o link vê só os horários das turmas da pessoa.
alter table public.perfil add column agenda_token uuid not null default gen_random_uuid() unique;
