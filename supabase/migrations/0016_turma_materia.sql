-- Turmas de qualquer matéria: os idiomas viram opcionais e a turma ganha "matéria".
-- Rodar uma vez no SQL Editor do Supabase, depois da 0015.

alter table public.turma add column materia text not null default '';
alter table public.turma alter column idioma_ensinado drop not null;
alter table public.turma alter column idioma_instrucao drop not null;

-- Toda turma é de idioma (os dois idiomas) ou de outra matéria (com nome).
alter table public.turma add constraint turma_idioma_ou_materia check (
  (idioma_ensinado is not null and idioma_instrucao is not null) or btrim(materia) <> ''
);
