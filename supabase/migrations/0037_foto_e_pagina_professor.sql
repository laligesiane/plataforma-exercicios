-- Foto de perfil (aluno e professor) e página pública do professor mais completa:
-- redes sociais prontas, frase de destaque, desde quando ensina, formação, modalidade, cidade e cor da capa.
-- Rodar uma vez no SQL Editor do Supabase ANTES do merge, depois da 0036. Pode rodar de novo sem erro.

-- 1. Foto de perfil: bucket público "avatar". Cada pessoa só mexe na própria pasta (<id>/arquivo).
--    A foto é reduzida no navegador para 400x400 antes de subir, por isso o limite é pequeno.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatar', 'avatar', true, 2 * 1024 * 1024, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "cada um envia a própria foto" on storage.objects;
drop policy if exists "cada um troca a própria foto" on storage.objects;
drop policy if exists "cada um apaga a própria foto" on storage.objects;

create policy "cada um envia a própria foto" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatar' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "cada um troca a própria foto" on storage.objects for update to authenticated
  using (bucket_id = 'avatar' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'avatar' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "cada um apaga a própria foto" on storage.objects for delete to authenticated
  using (bucket_id = 'avatar' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Guarda só o caminho do arquivo dentro do bucket, sempre na pasta da própria pessoa.
alter table public.perfil add column if not exists foto text;
alter table public.perfil drop constraint if exists perfil_foto_check;
alter table public.perfil add constraint perfil_foto_check
  check (foto is null or (foto ~ '^[0-9a-f-]{36}/[A-Za-z0-9-]{1,60}\.(jpg|png|webp)$' and split_part(foto, '/', 1) = id::text));

grant update (foto) on public.perfil to authenticated;

-- A página pública mostra a foto do professor (o perfil em si continua fechado).
create or replace function public.foto_do_professor(professor uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select p.foto
  from public.perfil p
  join public.pagina_professor pg on pg.professor_id = p.id
  where p.id = professor and (pg.publicada or pg.professor_id = (select auth.uid()));
$$;

revoke execute on function public.foto_do_professor(uuid) from public;
grant execute on function public.foto_do_professor(uuid) to anon, authenticated;

-- 2. Página do professor: redes sociais (só o usuário; o app monta o link) e mais informações.
alter table public.pagina_professor
  add column if not exists whatsapp text not null default '',
  add column if not exists instagram text not null default '',
  add column if not exists tiktok text not null default '',
  add column if not exists facebook text not null default '',
  add column if not exists youtube text not null default '',
  add column if not exists destaque text not null default '',
  add column if not exists ensina_desde smallint,
  add column if not exists formacao text not null default '',
  add column if not exists modalidade text not null default '',
  add column if not exists cidade text not null default '',
  add column if not exists cor text not null default 'menta';

alter table public.pagina_professor
  drop constraint if exists pagina_professor_whatsapp_check,
  drop constraint if exists pagina_professor_instagram_check,
  drop constraint if exists pagina_professor_tiktok_check,
  drop constraint if exists pagina_professor_facebook_check,
  drop constraint if exists pagina_professor_youtube_check,
  drop constraint if exists pagina_professor_destaque_check,
  drop constraint if exists pagina_professor_ensina_desde_check,
  drop constraint if exists pagina_professor_formacao_check,
  drop constraint if exists pagina_professor_modalidade_check,
  drop constraint if exists pagina_professor_cidade_check,
  drop constraint if exists pagina_professor_cor_check;

alter table public.pagina_professor
  add constraint pagina_professor_whatsapp_check check (whatsapp ~ '^([0-9]{10,15})?$'),
  add constraint pagina_professor_instagram_check check (instagram ~ '^([A-Za-z0-9._]{1,30})?$'),
  add constraint pagina_professor_tiktok_check check (tiktok ~ '^([A-Za-z0-9._]{2,24})?$'),
  add constraint pagina_professor_facebook_check check (facebook ~ '^([A-Za-z0-9.]{5,50})?$'),
  add constraint pagina_professor_youtube_check check (youtube ~ '^([A-Za-z0-9._-]{3,30})?$'),
  add constraint pagina_professor_destaque_check check (char_length(destaque) <= 120),
  add constraint pagina_professor_ensina_desde_check check (ensina_desde is null or ensina_desde between 1950 and 2100),
  add constraint pagina_professor_formacao_check check (char_length(formacao) <= 300),
  add constraint pagina_professor_modalidade_check check (modalidade in ('', 'online', 'presencial', 'ambos')),
  add constraint pagina_professor_cidade_check check (char_length(cidade) <= 80),
  add constraint pagina_professor_cor_check check (cor in ('menta', 'azul', 'rosa', 'roxo', 'laranja'));
