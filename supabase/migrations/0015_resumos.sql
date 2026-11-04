-- Resumos da turma: texto e mapa mental, ligados (ou não) a uma aula.
-- Rodar uma vez no SQL Editor do Supabase, depois da 0014.

create table public.resumo (
  id uuid primary key default gen_random_uuid(),
  turma_id uuid not null references public.turma (id) on delete cascade,
  aula_id uuid references public.aula (id) on delete set null,
  autor_id uuid not null default auth.uid() references public.perfil (id) on delete cascade,
  titulo text not null default '',
  texto text not null default '',
  mapa jsonb not null default '{"centro": "", "ramos": []}',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index on public.resumo (turma_id, atualizado_em desc);
create index on public.resumo (aula_id);

alter table public.resumo enable row level security;

create policy "professor vê resumos das suas turmas" on public.resumo for select
  using (public.eh_professor_da_turma(turma_id));

create policy "aluno vê resumos das suas turmas" on public.resumo for select
  using (public.eh_aluno_da_turma(turma_id));

create policy "professor cria resumos" on public.resumo for insert
  with check (public.eh_professor_da_turma(turma_id) and autor_id = (select auth.uid()));

create policy "professor edita resumos" on public.resumo for update
  using (public.eh_professor_da_turma(turma_id))
  with check (public.eh_professor_da_turma(turma_id));

create policy "professor apaga resumos" on public.resumo for delete
  using (public.eh_professor_da_turma(turma_id));
