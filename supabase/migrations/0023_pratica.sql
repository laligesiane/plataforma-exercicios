-- Práticas: atividades que o próprio aluno gera a partir de um resumo, para treinar sozinho.
-- Só o aluno vê, edita e apaga as dele. Não tem nota nem vai para o professor.
-- Rodar uma vez no SQL Editor do Supabase, depois da 0022.

create table if not exists public.pratica (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null default auth.uid() references public.perfil (id) on delete cascade,
  resumo_id uuid references public.resumo (id) on delete set null,
  titulo text not null check (btrim(titulo) <> '' and char_length(titulo) <= 200),
  -- Exercícios no formato do editor (src/lib/atividades/modelo.ts).
  exercicios jsonb not null default '[]'::jsonb check (jsonb_typeof(exercicios) = 'array'),
  criada_em timestamptz not null default now(),
  atualizada_em timestamptz not null default now()
);

create index if not exists pratica_aluno on public.pratica (aluno_id, criada_em desc);
create index if not exists pratica_resumo on public.pratica (resumo_id);

alter table public.pratica enable row level security;

drop policy if exists "aluno vê suas práticas" on public.pratica;
drop policy if exists "aluno cria suas práticas" on public.pratica;
drop policy if exists "aluno edita suas práticas" on public.pratica;
drop policy if exists "aluno apaga suas práticas" on public.pratica;

-- Condição direta do dono, para o insert(...).select() reler a linha nova.
create policy "aluno vê suas práticas" on public.pratica for select
  using (aluno_id = (select auth.uid()));

-- O resumo tem de ser um que o aluno enxerga (a subconsulta respeita as regras do resumo).
create policy "aluno cria suas práticas" on public.pratica for insert
  with check (
    aluno_id = (select auth.uid())
    and (resumo_id is null or exists (select 1 from public.resumo r where r.id = resumo_id))
  );

create policy "aluno edita suas práticas" on public.pratica for update
  using (aluno_id = (select auth.uid()))
  with check (aluno_id = (select auth.uid()));

create policy "aluno apaga suas práticas" on public.pratica for delete
  using (aluno_id = (select auth.uid()));

drop trigger if exists pratica_atualizada on public.pratica;
create trigger pratica_atualizada
  before update on public.pratica
  for each row execute function public.marcar_atualizacao();

-- Cada vez que o aluno pede para a IA gerar exercícios. Serve para o limite diário.
create table if not exists public.geracao_ia (
  id bigint generated always as identity primary key,
  aluno_id uuid not null default auth.uid() references public.perfil (id) on delete cascade,
  criada_em timestamptz not null default now()
);

create index if not exists geracao_ia_aluno on public.geracao_ia (aluno_id, criada_em desc);

alter table public.geracao_ia enable row level security;

drop policy if exists "aluno registra geração" on public.geracao_ia;
drop policy if exists "aluno vê suas gerações" on public.geracao_ia;

create policy "aluno registra geração" on public.geracao_ia for insert
  with check (aluno_id = (select auth.uid()));

create policy "aluno vê suas gerações" on public.geracao_ia for select
  using (aluno_id = (select auth.uid()));

revoke update, delete on public.geracao_ia from authenticated, anon;
