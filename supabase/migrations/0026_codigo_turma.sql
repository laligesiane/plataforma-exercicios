-- Entrar na turma por código ou QR code, sem esperar o convite por e-mail.
-- Rodar uma vez no SQL Editor do Supabase ANTES do merge, depois da 0025.

-- Código de 6 letras e números, sem os que se confundem (0/O, 1/I/L).
create function public.novo_codigo_turma()
returns text
language plpgsql
volatile
set search_path = ''
as $$
declare
  letras constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_codigo text;
begin
  loop
    v_codigo := '';
    for i in 1..6 loop
      v_codigo := v_codigo || substr(letras, 1 + floor(random() * length(letras))::int, 1);
    end loop;
    exit when not exists (select 1 from public.turma t where t.codigo = v_codigo);
  end loop;
  return v_codigo;
end;
$$;

alter table public.turma add column if not exists codigo text;
update public.turma set codigo = public.novo_codigo_turma() where codigo is null;
alter table public.turma alter column codigo set default public.novo_codigo_turma();
alter table public.turma alter column codigo set not null;
alter table public.turma add constraint turma_codigo_unico unique (codigo);

-- Quem abre o link vê só o nome da turma e do professor, mesmo sem ser da turma.
create function public.turma_pelo_codigo(p_codigo text)
returns table (turma_id uuid, nome text, professor text)
language sql
stable
security definer
set search_path = ''
as $$
  select t.id, t.nome, coalesce(p.nome, '')
  from public.turma t
  join public.perfil p on p.id = t.professor_id
  where t.codigo = upper(trim(p_codigo));
$$;

-- O aluno logado entra na turma do código. O limite de alunos do plano continua valendo (gatilho da turma_aluno).
create function public.entrar_na_turma(p_codigo text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  alvo uuid;
begin
  if not exists (select 1 from public.perfil where id = (select auth.uid()) and papel = 'aluno') then
    raise exception 'so_aluno';
  end if;
  select id into alvo from public.turma where codigo = upper(trim(p_codigo));
  if alvo is null then
    raise exception 'codigo_invalido';
  end if;
  if not exists (select 1 from public.turma_aluno where turma_id = alvo and aluno_id = (select auth.uid())) then
    insert into public.turma_aluno (turma_id, aluno_id) values (alvo, (select auth.uid()));
  end if;
  return alvo;
end;
$$;

revoke execute on function public.turma_pelo_codigo(text) from public;
grant execute on function public.turma_pelo_codigo(text) to anon, authenticated;
revoke execute on function public.entrar_na_turma(text) from public, anon;
grant execute on function public.entrar_na_turma(text) to authenticated;
revoke execute on function public.novo_codigo_turma() from anon;
