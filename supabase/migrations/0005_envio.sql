-- "Enviar respostas": guarda cada envio do aluno com o resumo de acertos (não é nota).
-- Rodar uma vez no SQL Editor do Supabase, depois da 0004.

create table public.envio (
  id bigint generated always as identity primary key,
  aluno_id uuid not null default auth.uid() references public.perfil (id) on delete cascade,
  atividade_id uuid not null references public.atividade (id) on delete cascade,
  certos int not null check (certos >= 0),
  de_primeira int not null check (de_primeira >= 0),
  total int not null check (total >= 0),
  enviado_em timestamptz not null default now()
);

create index on public.envio (atividade_id, aluno_id);

alter table public.envio enable row level security;

create policy "aluno registra envio" on public.envio for insert
  with check (aluno_id = (select auth.uid()) and public.eh_aluno_da_atividade(atividade_id));

create policy "aluno vê os próprios envios" on public.envio for select
  using (aluno_id = (select auth.uid()));

create policy "professor vê envios da atividade" on public.envio for select
  using (public.eh_professor_da_atividade(atividade_id));

revoke update, delete on public.envio from authenticated, anon;
