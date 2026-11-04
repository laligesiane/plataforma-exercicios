-- Aulas: cada encontro da turma, com o que foi visto, próximos passos e tarefa de casa.
-- Rodar uma vez no SQL Editor do Supabase, depois da 0013.

create table public.aula (
  id uuid primary key default gen_random_uuid(),
  turma_id uuid not null references public.turma (id) on delete cascade,
  data date not null,
  titulo text not null default '',
  resumo text not null default '',           -- o que foi visto
  proximos_passos text not null default '',  -- o que fica para a próxima aula
  tarefa text not null default '',           -- para casa
  criada_em timestamptz not null default now(),
  atualizada_em timestamptz not null default now()
);

create index on public.aula (turma_id, data desc);

alter table public.aula enable row level security;

-- As funções consultam turma/turma_aluno, não esta tabela, então o insert(...).select() relê a linha nova.
create policy "professor vê aulas das suas turmas" on public.aula for select
  using (public.eh_professor_da_turma(turma_id));

create policy "aluno vê aulas das suas turmas" on public.aula for select
  using (public.eh_aluno_da_turma(turma_id));

create policy "professor cria aulas" on public.aula for insert
  with check (public.eh_professor_da_turma(turma_id));

create policy "professor edita aulas" on public.aula for update
  using (public.eh_professor_da_turma(turma_id))
  with check (public.eh_professor_da_turma(turma_id));

create policy "professor apaga aulas" on public.aula for delete
  using (public.eh_professor_da_turma(turma_id));
