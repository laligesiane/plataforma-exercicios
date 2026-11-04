-- Etapa 4: produção escrita e oral (o professor corrige) e exercício com link do Kahoot.
-- Rodar uma vez no SQL Editor do Supabase, depois da 0007. Pode rodar de novo sem erro.

-- 1. Novos tipos de exercício.
alter table public.exercicio drop constraint if exists exercicio_tipo_check;
alter table public.exercicio add constraint exercicio_tipo_check
  check (tipo in ('lacuna', 'multipla_escolha', 'arrastar', 'classificar', 'relacionar', 'producao', 'kahoot'));

-- 2. O que o aluno produziu: um texto ou um áudio por item (a última versão vale).
create table if not exists public.producao (
  id bigint generated always as identity primary key,
  aluno_id uuid not null default auth.uid() references public.perfil (id) on delete cascade,
  atividade_id uuid not null references public.atividade (id) on delete cascade,
  exercicio_id uuid not null references public.exercicio (id) on delete cascade,
  item_id text not null check (length(item_id) <= 64),
  texto text not null default '' check (length(texto) <= 5000),
  -- Caminho do áudio no bucket "producao": <aluno>/<atividade>/<arquivo>.
  audio text check (audio is null or length(audio) <= 300),
  enviada_em timestamptz not null default now(),
  unique (aluno_id, atividade_id, item_id)
);

create index if not exists producao_atividade on public.producao (atividade_id);

alter table public.producao enable row level security;

drop policy if exists "aluno envia produção" on public.producao;
drop policy if exists "aluno refaz produção" on public.producao;
drop policy if exists "aluno vê as próprias produções" on public.producao;
drop policy if exists "professor vê produções da atividade" on public.producao;

create policy "aluno envia produção" on public.producao for insert to authenticated
  with check (
    aluno_id = (select auth.uid())
    and public.eh_aluno_da_atividade(atividade_id)
    and exists (select 1 from public.exercicio e where e.id = exercicio_id and e.atividade_id = producao.atividade_id)
  );

create policy "aluno refaz produção" on public.producao for update to authenticated
  using (aluno_id = (select auth.uid()))
  with check (
    aluno_id = (select auth.uid())
    and public.eh_aluno_da_atividade(atividade_id)
    and exists (select 1 from public.exercicio e where e.id = exercicio_id and e.atividade_id = producao.atividade_id)
  );

create policy "aluno vê as próprias produções" on public.producao for select to authenticated
  using (aluno_id = (select auth.uid()));

create policy "professor vê produções da atividade" on public.producao for select to authenticated
  using (public.eh_professor_da_atividade(atividade_id));

revoke delete on public.producao from authenticated, anon;

-- 3. Correção do professor: comentário e avaliação, uma por produção.
create table if not exists public.correcao (
  producao_id bigint primary key references public.producao (id) on delete cascade,
  atividade_id uuid not null references public.atividade (id) on delete cascade,
  avaliacao text not null check (avaliacao in ('muito_bem', 'refazer')),
  comentario text not null default '' check (length(comentario) <= 3000),
  corrigida_em timestamptz not null default now()
);

alter table public.correcao enable row level security;

drop policy if exists "professor corrige" on public.correcao;
drop policy if exists "professor atualiza correção" on public.correcao;
drop policy if exists "professor vê correções" on public.correcao;
drop policy if exists "aluno vê correção da sua produção" on public.correcao;

-- A atividade da correção tem de ser a da produção, e o professor tem de ser o dono dela.
create policy "professor corrige" on public.correcao for insert to authenticated
  with check (
    public.eh_professor_da_atividade(atividade_id)
    and exists (select 1 from public.producao p where p.id = producao_id and p.atividade_id = correcao.atividade_id)
  );

create policy "professor atualiza correção" on public.correcao for update to authenticated
  using (public.eh_professor_da_atividade(atividade_id))
  with check (
    public.eh_professor_da_atividade(atividade_id)
    and exists (select 1 from public.producao p where p.id = producao_id and p.atividade_id = correcao.atividade_id)
  );

create policy "professor vê correções" on public.correcao for select to authenticated
  using (public.eh_professor_da_atividade(atividade_id));

create policy "aluno vê correção da sua produção" on public.correcao for select to authenticated
  using (exists (select 1 from public.producao p where p.id = producao_id and p.aluno_id = (select auth.uid())));

revoke delete on public.correcao from authenticated, anon;

-- 4. Áudios dos alunos: bucket privado. O aluno grava na pasta dele, dentro da atividade;
--    o professor da atividade ouve. Ninguém mais tem acesso.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('producao', 'producao', false, 20 * 1024 * 1024,
        array['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/x-m4a'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Lê o id da atividade no caminho sem dar erro quando não for um uuid.
create or replace function public.uuid_ou_nulo(texto text)
returns uuid
language sql
immutable
as $$
  select case
    when texto ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then texto::uuid
  end;
$$;

drop policy if exists "aluno envia áudio" on storage.objects;
drop policy if exists "aluno e professor ouvem áudio" on storage.objects;

create policy "aluno envia áudio" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'producao'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and public.eh_aluno_da_atividade(public.uuid_ou_nulo((storage.foldername(name))[2]))
  );

create policy "aluno e professor ouvem áudio" on storage.objects for select to authenticated
  using (
    bucket_id = 'producao'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or public.eh_professor_da_atividade(public.uuid_ou_nulo((storage.foldername(name))[2]))
    )
  );
