-- Biblioteca para qualquer professor: a atividade ganha "etapa de ensino" e "temas".
-- Rodar uma vez no SQL Editor do Supabase, ANTES do merge (depois da 0036_curso_duracao).
-- Tudo é opcional: atividades que já existem continuam iguais (sem etapa e sem temas).
-- O nível A1 a C2 continua valendo só para as atividades de idioma.

alter table public.atividade
  add column if not exists etapa text not null default '',
  add column if not exists temas text[] not null default '{}';

alter table public.atividade drop constraint if exists atividade_etapa_valida;
alter table public.atividade add constraint atividade_etapa_valida check (
  etapa in ('', 'infantil', 'fundamental_1', 'fundamental_2', 'medio', 'vestibular', 'superior', 'concursos', 'livre')
);

alter table public.atividade drop constraint if exists atividade_temas_limite;
alter table public.atividade add constraint atividade_temas_limite check (cardinality(temas) <= 8);

-- Filtro por tema na biblioteca (temas @> '{frações}').
create index if not exists atividade_temas_idx on public.atividade using gin (temas);
