-- Imagem e áudio dos exercícios: bucket "midia" no Storage do Supabase.
-- Rodar uma vez no SQL Editor do Supabase, depois da 0005.
--
-- Cada professor só grava na própria pasta (<id do professor>/arquivo).
-- A leitura é pública, porque o aluno abre o arquivo direto pelo link,
-- e o nome de cada arquivo é um código aleatório que ninguém adivinha.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'midia',
  'midia',
  true,
  20 * 1024 * 1024,
  array[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/wav', 'audio/ogg', 'audio/webm'
  ]
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Pode rodar de novo sem erro: as regras antigas são trocadas pelas novas.
drop policy if exists "professor envia mídia na sua pasta" on storage.objects;
drop policy if exists "professor troca mídia da sua pasta" on storage.objects;
drop policy if exists "professor apaga mídia da sua pasta" on storage.objects;

create policy "professor envia mídia na sua pasta" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'midia'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and public.eh_professor()
  );

create policy "professor troca mídia da sua pasta" on storage.objects for update to authenticated
  using (bucket_id = 'midia' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'midia' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "professor apaga mídia da sua pasta" on storage.objects for delete to authenticated
  using (bucket_id = 'midia' and (storage.foldername(name))[1] = (select auth.uid())::text);
