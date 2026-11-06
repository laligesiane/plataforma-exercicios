-- Idioma do conteúdo: em que língua a atividade ou o resumo foi escrito (pt, es, en...).
-- As bibliotecas públicas mostram só o que está no idioma de quem visita.
-- Rodar uma vez no SQL Editor do Supabase ANTES do merge, depois da 0040. Pode rodar de novo sem erro.
--
-- Regra: atividade ou resumo de turma de IDIOMA usa o idioma das explicações (idioma_instrucao);
-- nos de outras matérias vale o que o app mandar ao criar (idioma da interface de quem criou),
-- e, sem isso, o idioma da conta do autor ou português.

alter table public.atividade add column if not exists idioma text;
alter table public.resumo add column if not exists idioma text;

create index if not exists atividade_publica_idioma_idx on public.atividade (idioma, atualizada_em desc) where publica and publicada;
create index if not exists resumo_publico_idioma_idx on public.resumo (idioma, atualizado_em desc) where publico and publicado;

create or replace function public.atividade_idioma()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if btrim(coalesce(new.materia, '')) = '' and new.idioma_instrucao is not null then
    new.idioma := new.idioma_instrucao;
  elsif new.idioma is null then
    select p.idioma into new.idioma from public.perfil p where p.id = new.professor_id;
    new.idioma := coalesce(new.idioma, 'pt');
  end if;
  return new;
end;
$$;

drop trigger if exists atividade_idioma on public.atividade;
create trigger atividade_idioma before insert or update on public.atividade
  for each row execute function public.atividade_idioma();

create or replace function public.resumo_idioma()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  instrucao text;
begin
  if new.turma_id is not null then
    select case when btrim(coalesce(t.materia, '')) = '' then t.idioma_instrucao end
      into instrucao
      from public.turma t where t.id = new.turma_id;
  end if;
  if instrucao is not null then
    new.idioma := instrucao;
  elsif new.idioma is null then
    select p.idioma into new.idioma from public.perfil p where p.id = new.autor_id;
    new.idioma := coalesce(new.idioma, 'pt');
  end if;
  return new;
end;
$$;

drop trigger if exists resumo_idioma on public.resumo;
create trigger resumo_idioma before insert or update on public.resumo
  for each row execute function public.resumo_idioma();

-- Preenche o que já existe, com os gatilhos da tabela desligados só durante a conta,
-- para as datas de "atualizada em" não mudarem (a ordem da biblioteca fica a mesma).
alter table public.atividade disable trigger user;
update public.atividade a
   set idioma = case
     when btrim(coalesce(a.materia, '')) = '' and a.idioma_instrucao is not null then a.idioma_instrucao
     else coalesce((select p.idioma from public.perfil p where p.id = a.professor_id), 'pt')
   end
 where a.idioma is null;
alter table public.atividade enable trigger user;

alter table public.resumo disable trigger user;
update public.resumo r
   set idioma = coalesce(
     (select t.idioma_instrucao from public.turma t where t.id = r.turma_id and btrim(coalesce(t.materia, '')) = ''),
     (select p.idioma from public.perfil p where p.id = r.autor_id),
     'pt')
 where r.idioma is null;
alter table public.resumo enable trigger user;
