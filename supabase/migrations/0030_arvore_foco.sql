-- Coleção de árvores do modo foco: cada sessão concluída vira uma árvore guardada na conta do aluno.
-- Os selos são calculados a partir destas árvores, então não precisam de tabela.
-- Rodar uma vez no SQL Editor do Supabase ANTES do merge (pode ser antes ou depois da 0029).

create table public.arvore_foco (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null default auth.uid() references public.perfil (id) on delete cascade,
  especie text not null check (especie ~ '^[a-z-]{2,30}$'),
  minutos integer not null check (minutos between 1 and 240),
  -- Dia no relógio do aluno, para "3 árvores no mesmo dia" e "dias seguidos" baterem com o calendário dele.
  dia date not null,
  plantada_em timestamptz not null default now()
);

create index arvore_foco_aluno_idx on public.arvore_foco (aluno_id, plantada_em desc);

alter table public.arvore_foco enable row level security;

create policy "aluno vê as próprias árvores" on public.arvore_foco for select
  using (aluno_id = (select auth.uid()));

create policy "aluno planta as próprias árvores" on public.arvore_foco for insert
  with check (aluno_id = (select auth.uid()));

create policy "aluno apaga as próprias árvores" on public.arvore_foco for delete
  using (aluno_id = (select auth.uid()));
