-- Convites por e-mail com limite diário e exclusão da própria conta (05/11/2026).
-- Rodar uma vez no SQL Editor do Supabase, ANTES do merge.

-- ---------- Registro dos convites enviados por e-mail ----------
-- Serve para limitar quantos convites cada professor manda por dia (evita spam pelo domínio repasa.com.br).
-- Só o servidor (chave service_role) lê e grava: RLS ligado e nenhuma policy.
create table if not exists public.convite_envio (
  id bigint generated always as identity primary key,
  professor_id uuid not null references public.perfil (id) on delete cascade,
  email text not null,
  criado_em timestamptz not null default now()
);

create index if not exists convite_envio_professor_data on public.convite_envio (professor_id, criado_em desc);

alter table public.convite_envio enable row level security;
revoke all on public.convite_envio from anon, authenticated;
