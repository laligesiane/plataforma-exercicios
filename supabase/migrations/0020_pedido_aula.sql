-- Pedidos de aula: o aluno pede uma aula para o professor da turma, que aceita ou recusa.
-- Ao aceitar, a aula é criada na data pedida e aparece na agenda do aluno.
-- Rodar uma vez no SQL Editor do Supabase, depois da 0019 (ou da 0018 se a 0019 ainda não existir).

create table public.pedido_aula (
  id uuid primary key default gen_random_uuid(),
  turma_id uuid not null references public.turma (id) on delete cascade,
  aluno_id uuid not null default auth.uid() references public.perfil (id) on delete cascade,
  data date not null,
  hora time,
  mensagem text not null default '' check (char_length(mensagem) <= 1000),
  status text not null default 'pendente' check (status in ('pendente', 'aceito', 'recusado')),
  aula_id uuid references public.aula (id) on delete set null,
  criado_em timestamptz not null default now(),
  respondido_em timestamptz
);

create index on public.pedido_aula (turma_id, status);
create index on public.pedido_aula (aluno_id, data);

alter table public.pedido_aula enable row level security;

-- Condição direta do aluno, para o insert(...).select() reler a linha nova.
create policy "aluno vê seus pedidos" on public.pedido_aula for select
  using (aluno_id = (select auth.uid()));

create policy "aluno pede aula nas suas turmas" on public.pedido_aula for insert
  with check (
    aluno_id = (select auth.uid())
    and status = 'pendente'
    and aula_id is null
    and public.eh_aluno_da_turma(turma_id)
  );

create policy "aluno cancela pedido pendente" on public.pedido_aula for delete
  using (aluno_id = (select auth.uid()) and status = 'pendente');

create policy "professor vê pedidos das suas turmas" on public.pedido_aula for select
  using (public.eh_professor_da_turma(turma_id));

create policy "professor responde pedidos" on public.pedido_aula for update
  using (public.eh_professor_da_turma(turma_id))
  with check (public.eh_professor_da_turma(turma_id));
