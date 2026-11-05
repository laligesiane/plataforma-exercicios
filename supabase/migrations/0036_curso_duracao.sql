-- Duração do curso: quando começou, quanto tempo dura e em que etapa o aluno está.
-- Rodar uma vez no SQL Editor do Supabase, ANTES do merge (depois da 0034_cursos).
-- Tudo é opcional: cursos que já existem continuam iguais, só sem a barra de progresso.

alter table public.curso
  add column inicio date,
  add column duracao_meses int check (duracao_meses between 1 and 240),
  add column etapa text check (char_length(etapa) <= 60);
