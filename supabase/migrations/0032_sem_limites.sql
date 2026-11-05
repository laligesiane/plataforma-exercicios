-- Repasa ilimitada por enquanto (05/11/2026): tira os limites do plano grátis.
-- Rodar uma vez no SQL Editor do Supabase. Pode rodar antes ou depois do merge.
--
-- Limite vazio (null) quer dizer "sem limite": os gatilhos de turmas, alunos, atividades
-- e matérias continuam existindo, mas não barram nada quando o limite é null.

alter table public.plano alter column max_turmas drop not null;
alter table public.plano alter column max_alunos_por_turma drop not null;
alter table public.plano alter column max_atividades_por_turma drop not null;
alter table public.plano alter column max_materias drop not null;

update public.plano
set max_turmas = null, max_alunos_por_turma = null, max_atividades_por_turma = null, max_materias = null
where id = 'gratis';

-- Para voltar com os limites (e trocar LIMITES_LIGADOS para true em src/lib/limites.ts):
-- update public.plano
-- set max_turmas = 3, max_alunos_por_turma = 10, max_atividades_por_turma = 4, max_materias = 3
-- where id = 'gratis';
