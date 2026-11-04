-- Atividades de qualquer matéria, como as turmas (0016): os idiomas viram opcionais
-- e a atividade ganha "matéria". Rodar uma vez no SQL Editor do Supabase, depois da 0016.

alter table public.atividade add column if not exists materia text not null default '';
alter table public.atividade alter column idioma_ensinado drop not null;
alter table public.atividade alter column idioma_instrucao drop not null;

-- Toda atividade é de idioma (os dois idiomas) ou de outra matéria (com nome).
alter table public.atividade drop constraint if exists atividade_idioma_ou_materia;
alter table public.atividade add constraint atividade_idioma_ou_materia check (
  (idioma_ensinado is not null and idioma_instrucao is not null) or btrim(materia) <> ''
);
