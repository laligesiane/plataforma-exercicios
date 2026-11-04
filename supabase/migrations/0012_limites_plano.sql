-- Plano grátis: 3 turmas, 10 alunos por turma e 4 atividades por turma (decidido em 04/11/2026).
-- Rodar uma vez no SQL Editor do Supabase, depois da 0011_agenda.sql.

alter table public.plano add column max_atividades_por_turma int not null default 4;

update public.plano set max_turmas = 3, max_alunos_por_turma = 10, max_atividades_por_turma = 4 where id = 'gratis';

create function public.checar_limite_atividades()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  limite int;
  atual int;
begin
  select p.max_atividades_por_turma into limite
  from public.turma t
  join public.perfil pf on pf.id = t.professor_id
  join public.plano p on p.id = pf.plano_id
  where t.id = new.turma_id;

  select count(*) into atual from public.atividade_turma where turma_id = new.turma_id;

  if atual >= limite then
    raise exception 'limite_atividades' using hint = 'A turma chegou ao limite de atividades do plano.';
  end if;
  return new;
end;
$$;

create trigger limite_atividades
  before insert on public.atividade_turma
  for each row execute function public.checar_limite_atividades();
