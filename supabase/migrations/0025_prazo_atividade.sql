-- Prazo da atividade ("entregar até"). Opcional; não é nota, só organiza a lista "Para fazer" do aluno.
-- Rodar uma vez no SQL Editor do Supabase ANTES do merge, depois da 0024.

alter table public.atividade add column if not exists prazo date;
