-- Página pública do professor (repasa.com.br/p/apelido): apresentação, matérias, contato e atividades públicas.
-- Rodar uma vez no SQL Editor do Supabase ANTES do merge, depois da 0028.

create table public.pagina_professor (
  professor_id uuid primary key default auth.uid() references public.perfil (id) on delete cascade,
  apelido text not null unique check (apelido ~ '^[a-z0-9]([a-z0-9-]{1,38}[a-z0-9])$'),
  nome text not null check (char_length(nome) between 1 and 80),
  bio text not null default '' check (char_length(bio) <= 1500),
  materias text not null default '' check (char_length(materias) <= 200),
  contato text not null default '' check (char_length(contato) <= 200),
  publicada boolean not null default false,
  atualizada_em timestamptz not null default now()
);

alter table public.pagina_professor enable row level security;

create policy "qualquer um vê página publicada" on public.pagina_professor for select
  using (publicada or professor_id = (select auth.uid()));

create policy "professor cria a própria página" on public.pagina_professor for insert
  with check (professor_id = (select auth.uid()) and public.eh_professor());

create policy "professor edita a própria página" on public.pagina_professor for update
  using (professor_id = (select auth.uid()))
  with check (professor_id = (select auth.uid()));

create policy "professor apaga a própria página" on public.pagina_professor for delete
  using (professor_id = (select auth.uid()));
