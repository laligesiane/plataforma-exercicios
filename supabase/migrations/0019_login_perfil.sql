-- Entrar com Google e escolher o tipo de conta no primeiro acesso.
-- Rodar uma vez no SQL Editor do Supabase. Pode rodar de novo sem erro.

-- Quem entra pela primeira vez com o Google ainda não disse se é professor ou aluno.
alter table public.perfil add column if not exists papel_escolhido boolean not null default true;

-- Novo perfil: nome também vem do Google (full_name / name); sem papel informado, pergunta no primeiro acesso.
create or replace function public.criar_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfil (id, email, nome, papel, papel_escolhido)
  values (
    new.id,
    new.email,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'nome', ''),
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', '')
    ),
    case when new.raw_user_meta_data ->> 'papel' = 'professor' then 'professor'::public.papel else 'aluno'::public.papel end,
    new.raw_user_meta_data ->> 'papel' is not null
  );
  return new;
end;
$$;

-- Escolha do tipo de conta: só uma vez, só para a própria conta.
create or replace function public.escolher_papel(novo public.papel)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.perfil
     set papel = novo, papel_escolhido = true
   where id = (select auth.uid()) and not papel_escolhido;
end;
$$;

revoke execute on function public.escolher_papel(public.papel) from public, anon;
grant execute on function public.escolher_papel(public.papel) to authenticated;
