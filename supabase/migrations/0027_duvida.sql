-- Botão "Não entendi": o aluno manda uma dúvida sobre um exercício e o professor responde.
-- Rodar uma vez no SQL Editor do Supabase ANTES do merge, depois da 0026.

create table public.duvida (
  id bigint generated always as identity primary key,
  aluno_id uuid not null default auth.uid() references public.perfil (id) on delete cascade,
  atividade_id uuid not null references public.atividade (id) on delete cascade,
  exercicio_id uuid not null references public.exercicio (id) on delete cascade,
  texto text not null check (char_length(texto) between 1 and 1000),
  resposta text check (char_length(resposta) <= 2000),
  criada_em timestamptz not null default now(),
  respondida_em timestamptz
);

create index on public.duvida (atividade_id, criada_em);
create index on public.duvida (aluno_id);

alter table public.duvida enable row level security;

create policy "aluno manda dúvida" on public.duvida for insert
  with check (
    aluno_id = (select auth.uid())
    and public.eh_aluno_da_atividade(atividade_id)
    and exists (select 1 from public.exercicio e where e.id = exercicio_id and e.atividade_id = duvida.atividade_id)
  );

create policy "aluno vê as próprias dúvidas" on public.duvida for select
  using (aluno_id = (select auth.uid()));

create policy "professor vê dúvidas da atividade" on public.duvida for select
  using (public.eh_professor_da_atividade(atividade_id));

create policy "professor responde dúvida" on public.duvida for update
  using (public.eh_professor_da_atividade(atividade_id))
  with check (public.eh_professor_da_atividade(atividade_id));

-- O aluno não edita nem apaga; o professor só escreve a resposta.
revoke update, delete on public.duvida from authenticated, anon;
grant update (resposta, respondida_em) on public.duvida to authenticated;
