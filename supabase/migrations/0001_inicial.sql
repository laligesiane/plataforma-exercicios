-- Professores, alunos, planos e turmas.
-- Rodar uma vez no SQL Editor do Supabase.

-- ---------- Planos ----------
create table public.plano (
  id text primary key,
  nome text not null,
  max_turmas int not null,
  max_alunos_por_turma int not null,
  preco_mensal_centavos int not null default 0
);

insert into public.plano (id, nome, max_turmas, max_alunos_por_turma) values
  ('gratis', 'Grátis', 1, 10);

alter table public.plano enable row level security;
create policy "planos são públicos" on public.plano for select using (true);

-- ---------- Perfis ----------
create type public.papel as enum ('professor', 'aluno');

create table public.perfil (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  nome text,
  papel public.papel not null default 'aluno',
  plano_id text not null default 'gratis' references public.plano (id),
  criado_em timestamptz not null default now()
);

alter table public.perfil enable row level security;

-- Cadastro pelo site cria professor; convite de turma cria aluno.
create function public.criar_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfil (id, email, nome, papel)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'nome',
    case when new.raw_user_meta_data ->> 'papel' = 'professor' then 'professor'::public.papel else 'aluno'::public.papel end
  );
  return new;
end;
$$;

create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function public.criar_perfil();

-- ---------- Turmas ----------
create table public.turma (
  id uuid primary key default gen_random_uuid(),
  professor_id uuid not null references public.perfil (id) on delete cascade,
  nome text not null,
  idioma_ensinado text not null,
  idioma_instrucao text not null,
  criada_em timestamptz not null default now()
);

create index on public.turma (professor_id);

create table public.turma_aluno (
  turma_id uuid not null references public.turma (id) on delete cascade,
  aluno_id uuid not null references public.perfil (id) on delete cascade,
  entrou_em timestamptz not null default now(),
  primary key (turma_id, aluno_id)
);

create index on public.turma_aluno (aluno_id);

alter table public.turma enable row level security;
alter table public.turma_aluno enable row level security;

-- Funções auxiliares das regras de acesso ("security definer" evita recursão no RLS).
create function public.eh_professor_da_turma(alvo uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.turma where id = alvo and professor_id = (select auth.uid()));
$$;

create function public.eh_aluno_da_turma(alvo uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.turma_aluno where turma_id = alvo and aluno_id = (select auth.uid()));
$$;

create function public.eh_professor()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.perfil where id = (select auth.uid()) and papel = 'professor');
$$;

-- Perfil: cada um vê o seu; professor vê os alunos das suas turmas.
create policy "cada um vê o próprio perfil" on public.perfil for select
  using ((select auth.uid()) = id);

create policy "professor vê seus alunos" on public.perfil for select
  using (exists (
    select 1 from public.turma_aluno ta
    where ta.aluno_id = perfil.id and public.eh_professor_da_turma(ta.turma_id)
  ));

create policy "cada um edita o próprio nome" on public.perfil for update
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Papel e plano nunca mudam pelo app.
revoke update on public.perfil from authenticated;
grant update (nome) on public.perfil to authenticated;

-- Turma: professor gerencia as suas; aluno vê as turmas em que está.
create policy "professor vê suas turmas" on public.turma for select
  using (professor_id = (select auth.uid()));

create policy "aluno vê suas turmas" on public.turma for select
  using (public.eh_aluno_da_turma(id));

create policy "professor cria turma" on public.turma for insert
  with check (professor_id = (select auth.uid()) and public.eh_professor());

create policy "professor edita turma" on public.turma for update
  using (professor_id = (select auth.uid())) with check (professor_id = (select auth.uid()));

create policy "professor apaga turma" on public.turma for delete
  using (professor_id = (select auth.uid()));

-- Matrícula: professor vê e remove; aluno vê a própria. Entrada só pelo servidor (convite).
create policy "professor vê matrículas" on public.turma_aluno for select
  using (public.eh_professor_da_turma(turma_id));

create policy "aluno vê a própria matrícula" on public.turma_aluno for select
  using (aluno_id = (select auth.uid()));

create policy "professor remove aluno" on public.turma_aluno for delete
  using (public.eh_professor_da_turma(turma_id));

-- ---------- Limites do plano (valem mesmo fora do app) ----------
create function public.checar_limite_turmas()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  limite int;
  atual int;
begin
  select p.max_turmas into limite
  from public.perfil pf join public.plano p on p.id = pf.plano_id
  where pf.id = new.professor_id;

  select count(*) into atual from public.turma where professor_id = new.professor_id;

  if atual >= limite then
    raise exception 'limite_turmas' using hint = 'O plano atual não permite mais turmas.';
  end if;
  return new;
end;
$$;

create trigger limite_turmas
  before insert on public.turma
  for each row execute function public.checar_limite_turmas();

create function public.checar_limite_alunos()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  limite int;
  atual int;
begin
  select p.max_alunos_por_turma into limite
  from public.turma t
  join public.perfil pf on pf.id = t.professor_id
  join public.plano p on p.id = pf.plano_id
  where t.id = new.turma_id;

  select count(*) into atual from public.turma_aluno where turma_id = new.turma_id;

  if atual >= limite then
    raise exception 'limite_alunos' using hint = 'A turma chegou ao limite de alunos do plano.';
  end if;
  return new;
end;
$$;

create trigger limite_alunos
  before insert on public.turma_aluno
  for each row execute function public.checar_limite_alunos();
