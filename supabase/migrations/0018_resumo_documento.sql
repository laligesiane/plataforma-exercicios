-- Resumo como página: título, subtítulo, negrito, itálico, marca-texto, listas e notas.
-- O conteúdo fica em JSON (formato do editor). A coluna "texto" continua com o texto corrido.
alter table public.resumo add column if not exists conteudo jsonb;
