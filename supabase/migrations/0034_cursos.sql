-- Cursos do aluno: pastas para agrupar matérias (ex.: Espanhol, Faculdade, Ensino médio).
-- Rodar uma vez no SQL Editor do Supabase, ANTES do merge.
--
-- Matérias que já existem não mudam: ficam sem curso (curso_id vazio) e aparecem em
-- "Sem curso" até o aluno mover. Apagar um curso não apaga as matérias, só tira elas do curso.

create table public.curso (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null default auth.uid() references public.perfil (id) on delete cascade,
  nome text not null check (btrim(nome) <> ''),
  criado_em timestamptz not null default now()
);

create index on public.curso (aluno_id);

alter table public.curso enable row level security;

create policy "aluno vê seus cursos" on public.curso for select
  using (aluno_id = (select auth.uid()));

create policy "aluno cria seus cursos" on public.curso for insert
  with check (aluno_id = (select auth.uid()));

create policy "aluno edita seus cursos" on public.curso for update
  using (aluno_id = (select auth.uid()))
  with check (aluno_id = (select auth.uid()));

create policy "aluno apaga seus cursos" on public.curso for delete
  using (aluno_id = (select auth.uid()));

alter table public.materia add column curso_id uuid references public.curso (id) on delete set null;
create index on public.materia (curso_id);

-- A matéria só pode entrar num curso do mesmo aluno.
create function public.checar_curso_da_materia()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.curso_id is not null
     and not exists (select 1 from public.curso where id = new.curso_id and aluno_id = new.aluno_id) then
    raise exception 'curso_invalido' using hint = 'Este curso não é seu.';
  end if;
  return new;
end;
$$;

create trigger curso_da_materia
  before insert or update of curso_id on public.materia
  for each row execute function public.checar_curso_da_materia();
