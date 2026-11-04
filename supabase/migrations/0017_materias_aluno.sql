-- Aluno independente: matérias próprias e resumos/mapas mentais pessoais.
-- Rodar uma vez no SQL Editor do Supabase, depois da 0016.

alter table public.plano add column max_materias int not null default 3;

create table public.materia (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null default auth.uid() references public.perfil (id) on delete cascade,
  nome text not null check (btrim(nome) <> ''),
  cor text not null default 'menta',
  criada_em timestamptz not null default now()
);

create index on public.materia (aluno_id);

alter table public.materia enable row level security;

create policy "aluno vê suas matérias" on public.materia for select
  using (aluno_id = (select auth.uid()));

create policy "aluno cria suas matérias" on public.materia for insert
  with check (aluno_id = (select auth.uid()));

create policy "aluno edita suas matérias" on public.materia for update
  using (aluno_id = (select auth.uid()))
  with check (aluno_id = (select auth.uid()));

create policy "aluno apaga suas matérias" on public.materia for delete
  using (aluno_id = (select auth.uid()));

-- Limite do plano (grátis: 3 matérias).
create function public.checar_limite_materias()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  limite int;
  atual int;
begin
  select p.max_materias into limite
  from public.perfil pf join public.plano p on p.id = pf.plano_id
  where pf.id = new.aluno_id;

  select count(*) into atual from public.materia where aluno_id = new.aluno_id;

  if atual >= limite then
    raise exception 'limite_materias' using hint = 'O plano atual não permite mais matérias.';
  end if;
  return new;
end;
$$;

create trigger limite_materias
  before insert on public.materia
  for each row execute function public.checar_limite_materias();

-- Resumos passam a pertencer a uma turma (do professor) ou a uma matéria (do aluno).
alter table public.resumo alter column turma_id drop not null;
alter table public.resumo add column materia_id uuid references public.materia (id) on delete cascade;
alter table public.resumo add constraint resumo_turma_ou_materia check ((turma_id is null) <> (materia_id is null));
create index on public.resumo (materia_id);

create function public.eh_dono_da_materia(alvo uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.materia where id = alvo and aluno_id = (select auth.uid()));
$$;

-- Condição direta do autor em todas, para o insert(...).select() reler a linha nova.
create policy "aluno vê seus resumos" on public.resumo for select
  using (materia_id is not null and autor_id = (select auth.uid()));

create policy "aluno cria seus resumos" on public.resumo for insert
  with check (autor_id = (select auth.uid()) and public.eh_dono_da_materia(materia_id));

create policy "aluno edita seus resumos" on public.resumo for update
  using (materia_id is not null and autor_id = (select auth.uid()))
  with check (autor_id = (select auth.uid()) and public.eh_dono_da_materia(materia_id));

create policy "aluno apaga seus resumos" on public.resumo for delete
  using (materia_id is not null and autor_id = (select auth.uid()));
