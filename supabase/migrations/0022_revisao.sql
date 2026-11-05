-- "Repasar meus erros": fila de revisão espaçada de cada aluno.
-- Todo item que o aluno erra entra na fila para o dia seguinte. Na revisão, acertar de primeira
-- empurra o item para 3 dias e depois para 7; acertar de novo conclui. Errar volta para amanhã.
-- Rodar uma vez no SQL Editor do Supabase, depois da 0021.

create table public.revisao (
  id bigint generated always as identity primary key,
  aluno_id uuid not null default auth.uid() references public.perfil (id) on delete cascade,
  atividade_id uuid not null references public.atividade (id) on delete cascade,
  exercicio_id uuid not null references public.exercicio (id) on delete cascade,
  item_id text not null,
  -- 0 = errou há pouco (volta em 1 dia), 1 = acertou uma vez (3 dias), 2 = acertou duas (7 dias).
  etapa int not null default 0 check (etapa between 0 and 2),
  proxima_em date not null,
  concluida_em timestamptz,
  atualizada_em timestamptz not null default now(),
  unique (aluno_id, exercicio_id, item_id)
);

create index on public.revisao (aluno_id, proxima_em) where concluida_em is null;

alter table public.revisao enable row level security;

create policy "aluno vê a própria revisão" on public.revisao for select
  using (aluno_id = (select auth.uid()));

create policy "aluno avança a própria revisão" on public.revisao for update
  using (aluno_id = (select auth.uid()))
  with check (aluno_id = (select auth.uid()));

-- Linhas novas só entram pelo gatilho abaixo, e o aluno só mexe no andamento.
revoke insert, update, delete on public.revisao from authenticated, anon;
grant update (etapa, proxima_em, concluida_em, atualizada_em) on public.revisao to authenticated;

-- Cada resposta errada coloca (ou recoloca) o item na fila, para amanhã.
create function public.revisao_ao_errar()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'errado' then
    insert into public.revisao (aluno_id, atividade_id, exercicio_id, item_id, etapa, proxima_em)
    values (new.aluno_id, new.atividade_id, new.exercicio_id, new.item_id, 0,
            (now() at time zone 'America/Sao_Paulo')::date + 1)
    on conflict (aluno_id, exercicio_id, item_id) do update
      set etapa = 0, proxima_em = excluded.proxima_em, concluida_em = null, atualizada_em = now();
  end if;
  return new;
end;
$$;

create trigger resposta_entra_na_revisao
  after insert on public.resposta
  for each row execute function public.revisao_ao_errar();

-- Erros que já existem entram na fila para hoje, para a revisão já começar com conteúdo.
insert into public.revisao (aluno_id, atividade_id, exercicio_id, item_id, etapa, proxima_em)
select distinct aluno_id, atividade_id, exercicio_id, item_id, 0, (now() at time zone 'America/Sao_Paulo')::date
from public.resposta
where status = 'errado'
on conflict (aluno_id, exercicio_id, item_id) do nothing;
