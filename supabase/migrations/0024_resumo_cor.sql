-- Cor do resumo: troca o verde padrão dos destaques (subtítulos, marca-texto, notas e marcadores).
-- Rodar uma vez no SQL Editor do Supabase ANTES do merge, depois da 0023.

alter table public.resumo add column if not exists cor text not null default 'menta'
  check (cor in ('menta', 'azul', 'rosa', 'roxo', 'laranja'));
