-- Agenda pessoal do aluno: tarefas, provas e aulas de fora da Repasa (faculdade, curso, escola).
-- O aluno marca se fez, anota a nota e escreve o que quiser. Tudo entra no link de assinatura da agenda.
-- Rodar uma vez no SQL Editor do Supabase, depois da 0020.

create table public.compromisso (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null default auth.uid() references public.perfil (id) on delete cascade,
  tipo text not null default 'tarefa' check (tipo in ('tarefa', 'prova', 'aula', 'outro')),
  titulo text not null check (btrim(titulo) <> '' and char_length(titulo) <= 200),
  materia text not null default '' check (char_length(materia) <= 100),
  data date not null,
  hora time,
  feito boolean not null default false,
  nota text not null default '' check (char_length(nota) <= 20),
  anotacao text not null default '' check (char_length(anotacao) <= 2000),
  criado_em timestamptz not null default now()
);

create index on public.compromisso (aluno_id, data);

alter table public.compromisso enable row level security;

create policy "aluno vê seus compromissos" on public.compromisso for select
  using (aluno_id = (select auth.uid()));

create policy "aluno cria seus compromissos" on public.compromisso for insert
  with check (aluno_id = (select auth.uid()));

create policy "aluno edita seus compromissos" on public.compromisso for update
  using (aluno_id = (select auth.uid()))
  with check (aluno_id = (select auth.uid()));

create policy "aluno apaga seus compromissos" on public.compromisso for delete
  using (aluno_id = (select auth.uid()));
