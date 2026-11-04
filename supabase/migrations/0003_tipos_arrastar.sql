-- Exercícios de arrastar: lacunas com banco de palavras, classificar em colunas e relacionar.
-- Rodar uma vez no SQL Editor do Supabase, depois da 0002.

alter table public.exercicio drop constraint exercicio_tipo_check;
alter table public.exercicio add constraint exercicio_tipo_check
  check (tipo in ('lacuna', 'multipla_escolha', 'arrastar', 'classificar', 'relacionar'));

-- Partes do exercício que não são itens: palavras extras do banco, colunas.
alter table public.exercicio
  add column config jsonb not null default '{}'::jsonb check (jsonb_typeof(config) = 'object');
