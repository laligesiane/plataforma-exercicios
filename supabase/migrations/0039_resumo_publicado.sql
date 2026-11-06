-- Resumos do professor publicados como as atividades: rascunho (só o professor vê),
-- para os alunos da turma, ou público (qualquer pessoa, também na Biblioteca de resumos).
-- O resumo também ganha a matéria da turma e temas (etiquetas) para filtrar na Biblioteca.
-- Rodar uma vez no SQL Editor do Supabase ANTES do merge, depois da 0038. Pode rodar de novo sem erro.
-- Resumos que já existem continuam iguais: publicados para a turma e não públicos.

alter table public.resumo
  add column if not exists publicado boolean not null default true,
  add column if not exists publico boolean not null default false,
  add column if not exists materia text not null default '',
  add column if not exists idioma_ensinado text,
  add column if not exists temas text[] not null default '{}';

-- Só resumo de turma (do professor) pode ser público; o resumo do aluno é sempre particular.
alter table public.resumo drop constraint if exists resumo_publico_so_de_turma;
alter table public.resumo add constraint resumo_publico_so_de_turma check (not publico or turma_id is not null);

alter table public.resumo drop constraint if exists resumo_temas_limite;
alter table public.resumo add constraint resumo_temas_limite check (cardinality(temas) <= 8);

create index if not exists resumo_publico_idx on public.resumo (atualizado_em desc) where publico and publicado;
create index if not exists resumo_temas_idx on public.resumo using gin (temas);

-- A matéria (ou o idioma) vem sempre da turma, para a Biblioteca filtrar sem precisar ler a turma.
create or replace function public.resumo_materia_da_turma()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.turma_id is not null then
    select t.materia, case when btrim(t.materia) = '' then t.idioma_ensinado end
      into new.materia, new.idioma_ensinado
      from public.turma t where t.id = new.turma_id;
    new.materia := coalesce(new.materia, '');
  else
    new.materia := '';
    new.idioma_ensinado := null;
    new.publico := false;
  end if;
  return new;
end;
$$;

drop trigger if exists resumo_materia_da_turma on public.resumo;
create trigger resumo_materia_da_turma
  before insert or update of turma_id, publico, materia, idioma_ensinado on public.resumo
  for each row execute function public.resumo_materia_da_turma();

-- Turma trocou de matéria: os resumos dela acompanham.
create or replace function public.turma_atualiza_materia_dos_resumos()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.resumo set turma_id = turma_id where turma_id = new.id;
  return new;
end;
$$;

drop trigger if exists turma_atualiza_materia_dos_resumos on public.turma;
create trigger turma_atualiza_materia_dos_resumos
  after update of materia, idioma_ensinado on public.turma
  for each row execute function public.turma_atualiza_materia_dos_resumos();

-- Preenche a matéria dos resumos que já existem.
update public.resumo set turma_id = turma_id where turma_id is not null;

-- Aluno da turma só vê o que o professor publicou (rascunho fica só com o professor).
drop policy if exists "aluno vê resumos das suas turmas" on public.resumo;
create policy "aluno vê resumos das suas turmas" on public.resumo for select
  using (publicado and public.eh_aluno_da_turma(turma_id));

-- Qualquer pessoa, até sem login, vê os resumos públicos publicados.
drop policy if exists "qualquer pessoa vê resumos públicos" on public.resumo;
create policy "qualquer pessoa vê resumos públicos" on public.resumo for select
  using (publico and publicado);
