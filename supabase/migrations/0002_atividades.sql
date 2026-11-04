-- Atividades, exercícios e respostas dos alunos.
-- Rodar uma vez no SQL Editor do Supabase, depois da 0001.

-- ---------- Atividades ----------
create table public.atividade (
  id uuid primary key default gen_random_uuid(),
  professor_id uuid not null references public.perfil (id) on delete cascade,
  titulo text not null default 'Atividade sem título',
  nivel text not null default 'A1' check (nivel in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  categoria text not null default 'gramatica'
    check (categoria in ('gramatica', 'vocabulario', 'funcoes', 'ortografia', 'cultura')),
  idioma_ensinado text not null,
  idioma_instrucao text not null,
  explicacao text not null default '',
  publicada boolean not null default false,
  publica boolean not null default false,
  criada_em timestamptz not null default now(),
  atualizada_em timestamptz not null default now()
);

create index on public.atividade (professor_id);
create index on public.atividade (publicada, publica);

-- Em quais turmas a atividade aparece.
create table public.atividade_turma (
  atividade_id uuid not null references public.atividade (id) on delete cascade,
  turma_id uuid not null references public.turma (id) on delete cascade,
  primary key (atividade_id, turma_id)
);

create index on public.atividade_turma (turma_id);

-- Cada exercício guarda seus itens em JSON, no formato do motor de correção (src/lib/correcao/tipos.ts).
create table public.exercicio (
  id uuid primary key default gen_random_uuid(),
  atividade_id uuid not null references public.atividade (id) on delete cascade,
  ordem int not null default 0,
  tipo text not null check (tipo in ('lacuna', 'multipla_escolha')),
  titulo text not null default '',
  instrucoes text not null default '',
  itens jsonb not null default '[]'::jsonb check (jsonb_typeof(itens) = 'array')
);

create index on public.exercicio (atividade_id, ordem);

-- Uma linha por tentativa do aluno em um item.
create table public.resposta (
  id bigint generated always as identity primary key,
  aluno_id uuid not null default auth.uid() references public.perfil (id) on delete cascade,
  atividade_id uuid not null references public.atividade (id) on delete cascade,
  exercicio_id uuid not null references public.exercicio (id) on delete cascade,
  item_id text not null,
  valor text not null,
  status text not null check (status in ('certo', 'certo_com_aviso', 'errado')),
  criada_em timestamptz not null default now()
);

create index on public.resposta (atividade_id, aluno_id);

alter table public.atividade enable row level security;
alter table public.atividade_turma enable row level security;
alter table public.exercicio enable row level security;
alter table public.resposta enable row level security;

-- ---------- Funções auxiliares ----------
create function public.eh_professor_da_atividade(alvo uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.atividade where id = alvo and professor_id = (select auth.uid()));
$$;

-- Aluno da turma: vê as atividades publicadas da turma. Qualquer pessoa: vê as publicadas e públicas.
create function public.pode_ver_atividade(alvo uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.atividade a
    where a.id = alvo
      and (
        a.professor_id = (select auth.uid())
        or (a.publicada and a.publica)
        or (a.publicada and exists (
          select 1 from public.atividade_turma at
          join public.turma_aluno ta on ta.turma_id = at.turma_id
          where at.atividade_id = a.id and ta.aluno_id = (select auth.uid())
        ))
      )
  );
$$;

create function public.eh_aluno_da_atividade(alvo uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.atividade a
    join public.atividade_turma at on at.atividade_id = a.id
    join public.turma_aluno ta on ta.turma_id = at.turma_id
    where a.id = alvo and a.publicada and ta.aluno_id = (select auth.uid())
  );
$$;

-- ---------- Regras de acesso ----------
-- Atividade
create policy "ver atividade" on public.atividade for select
  using (public.pode_ver_atividade(id));

create policy "professor cria atividade" on public.atividade for insert
  with check (professor_id = (select auth.uid()) and public.eh_professor());

create policy "professor edita atividade" on public.atividade for update
  using (professor_id = (select auth.uid())) with check (professor_id = (select auth.uid()));

create policy "professor apaga atividade" on public.atividade for delete
  using (professor_id = (select auth.uid()));

-- Atividade na turma: o professor liga só atividades e turmas que são dele.
create policy "professor vê atribuições" on public.atividade_turma for select
  using (public.eh_professor_da_atividade(atividade_id));

create policy "aluno vê atribuições da turma" on public.atividade_turma for select
  using (public.eh_aluno_da_turma(turma_id));

create policy "professor atribui" on public.atividade_turma for insert
  with check (public.eh_professor_da_atividade(atividade_id) and public.eh_professor_da_turma(turma_id));

create policy "professor remove atribuição" on public.atividade_turma for delete
  using (public.eh_professor_da_atividade(atividade_id));

-- Exercício: quem vê a atividade vê os exercícios.
create policy "ver exercício" on public.exercicio for select
  using (public.pode_ver_atividade(atividade_id));

create policy "professor cria exercício" on public.exercicio for insert
  with check (public.eh_professor_da_atividade(atividade_id));

create policy "professor edita exercício" on public.exercicio for update
  using (public.eh_professor_da_atividade(atividade_id))
  with check (public.eh_professor_da_atividade(atividade_id));

create policy "professor apaga exercício" on public.exercicio for delete
  using (public.eh_professor_da_atividade(atividade_id));

-- Resposta: só o aluno das turmas da atividade grava; ele vê as dele e o professor vê as da sua atividade.
create policy "aluno grava resposta" on public.resposta for insert
  with check (
    aluno_id = (select auth.uid())
    and public.eh_aluno_da_atividade(atividade_id)
    and exists (select 1 from public.exercicio e where e.id = exercicio_id and e.atividade_id = resposta.atividade_id)
  );

create policy "aluno vê as próprias respostas" on public.resposta for select
  using (aluno_id = (select auth.uid()));

create policy "professor vê respostas da atividade" on public.resposta for select
  using (public.eh_professor_da_atividade(atividade_id));

-- Respostas não são editadas nem apagadas pelo app.
revoke update, delete on public.resposta from authenticated, anon;

-- Mantém atualizada_em em dia.
create function public.marcar_atualizacao()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.atualizada_em = now();
  return new;
end;
$$;

create trigger atividade_atualizada
  before update on public.atividade
  for each row execute function public.marcar_atualizacao();
