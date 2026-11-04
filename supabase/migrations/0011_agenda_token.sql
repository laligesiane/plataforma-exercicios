-- Link secreto de assinatura da agenda (.ics). Quem tem o link vê só os horários das turmas da pessoa.
-- Rodar uma vez no SQL Editor do Supabase, depois da 0010.

alter table public.perfil add column agenda_token uuid not null default gen_random_uuid() unique;
