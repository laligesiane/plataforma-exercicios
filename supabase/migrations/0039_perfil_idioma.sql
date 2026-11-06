-- Idioma da interface (pt, es, en): cada pessoa escolhe no seletor e a escolha vale em todos os aparelhos.
-- Sem valor (null), vale o idioma do navegador. Rodar uma vez no SQL Editor do Supabase. Pode rodar de novo sem erro.

alter table public.perfil add column if not exists idioma text;

alter table public.perfil drop constraint if exists perfil_idioma_check;
alter table public.perfil add constraint perfil_idioma_check check (idioma is null or idioma in ('pt', 'es', 'en'));

-- Cada um só troca o próprio idioma (a policy de update da 0001 já limita à própria linha).
grant update (idioma) on public.perfil to authenticated;

-- O idioma escolhido no cadastro chega nos metadados do usuário e já vai para o perfil.
-- Igual à 0019, só com a coluna idioma a mais.
create or replace function public.criar_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfil (id, email, nome, papel, papel_escolhido, idioma)
  values (
    new.id,
    new.email,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'nome', ''),
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', '')
    ),
    case when new.raw_user_meta_data ->> 'papel' = 'professor' then 'professor'::public.papel else 'aluno'::public.papel end,
    new.raw_user_meta_data ->> 'papel' is not null,
    case when new.raw_user_meta_data ->> 'idioma' in ('pt', 'es', 'en') then new.raw_user_meta_data ->> 'idioma' end
  );
  return new;
end;
$$;
