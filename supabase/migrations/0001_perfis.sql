-- Perfis com papel (professora ou aluno), criados automaticamente para cada usuário.
-- Rodar uma vez no SQL Editor do Supabase.

create type public.papel as enum ('professora', 'aluno');

create table public.perfil (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  nome text,
  papel public.papel not null default 'aluno',
  criado_em timestamptz not null default now()
);

alter table public.perfil enable row level security;

-- Função usada pelas regras de acesso. "security definer" evita recursão no RLS.
create function public.eh_professora()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.perfil where id = (select auth.uid()) and papel = 'professora'
  );
$$;

create policy "cada um vê o próprio perfil"
  on public.perfil for select
  using ((select auth.uid()) = id);

create policy "professora vê todos os perfis"
  on public.perfil for select
  using (public.eh_professora());

create policy "cada um edita o próprio nome"
  on public.perfil for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- O papel nunca muda pelo app: só por SQL, feito pela dona do projeto.
revoke update on public.perfil from authenticated;
grant update (nome) on public.perfil to authenticated;

-- Todo usuário novo entra como aluno, com o nome enviado no convite.
create function public.criar_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfil (id, email, nome)
  values (new.id, new.email, new.raw_user_meta_data ->> 'nome');
  return new;
end;
$$;

create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function public.criar_perfil();
