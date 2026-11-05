-- Cor da Repasa: cada pessoa escolhe a cor principal do app (botões, links e destaques). Verde menta é o padrão.
-- Rodar uma vez no SQL Editor do Supabase ANTES do merge. Pode rodar de novo sem erro.

alter table public.perfil add column if not exists tema text not null default 'menta';

alter table public.perfil drop constraint if exists perfil_tema_check;
alter table public.perfil add constraint perfil_tema_check check (tema in ('menta', 'azul', 'rosa', 'roxo', 'laranja'));

-- Cada um só troca a própria cor (a policy de update da 0001 já limita à própria linha).
grant update (tema) on public.perfil to authenticated;
