-- Trilha: o professor põe as atividades da turma em ordem e, se quiser, a próxima só abre
-- depois que o aluno envia a anterior.
-- Rodar uma vez no SQL Editor do Supabase ANTES do merge, depois da 0027.

alter table public.turma add column if not exists trilha boolean not null default false;
alter table public.atividade_turma add column if not exists ordem int not null default 0;

-- Ordem inicial: a de quando a atividade foi criada.
update public.atividade_turma at set ordem = sub.n
from (
  select at2.atividade_id, at2.turma_id, row_number() over (partition by at2.turma_id order by a.criada_em) as n
  from public.atividade_turma at2 join public.atividade a on a.id = at2.atividade_id
) sub
where at.atividade_id = sub.atividade_id and at.turma_id = sub.turma_id;

create policy "professor ordena atribuições" on public.atividade_turma for update
  using (public.eh_professor_da_turma(turma_id))
  with check (public.eh_professor_da_turma(turma_id));

revoke update on public.atividade_turma from authenticated, anon;
grant update (ordem) on public.atividade_turma to authenticated;
