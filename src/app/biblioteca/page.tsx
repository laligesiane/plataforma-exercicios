import type { Metadata } from "next";
import { fmt, NOME_NATIVO } from "@/i18n/config";
import { obterDicionario, obterIdioma } from "@/i18n/servidor";
import Link from "next/link";
import { duplicarAtividade } from "@/app/professor/atividades/actions";
import { AbasBiblioteca } from "@/components/AbasBiblioteca";
import { Cabecalho } from "@/components/Cabecalho";
import { botaoSecundario, campo } from "@/components/ui/estilos";
import { Icone } from "@/components/jogos/Icones";
import { linkBiblioteca, lerFiltros, opcoesDeEtapa, opcoesDeMateria, type ParametrosBiblioteca } from "@/lib/atividades/biblioteca";
import { etiquetasDaAtividade, niveis } from "@/lib/atividades/modelo";
import { obterPerfil } from "@/lib/perfil";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export const metadata: Metadata = {
  title: "Biblioteca de atividades · Repasa",
  description: "Atividades públicas feitas por professores na Repasa, com correção na hora e a explicação de cada erro. Grátis e sem anúncios.",
};

export default async function Biblioteca({ searchParams }: { searchParams: Promise<ParametrosBiblioteca> }) {
  const { busca, materia, nivel, tema } = lerFiltros(await searchParams);

  const supabase = await criarClienteServidor();
  const [perfil, idioma] = await Promise.all([obterPerfil(), obterIdioma()]);
  let consulta = supabase
    .from("atividade")
    .select("id, titulo, nivel, categoria, materia, idioma_ensinado, etapa, temas, professor_id, exercicio(count)")
    .eq("publicada", true)
    .eq("publica", true)
    // Só o que está no idioma de quem visita (0041).
    .eq("idioma", idioma)
    .order("atualizada_em", { ascending: false })
    .limit(60);
  if (busca) {
    // A busca acha pelo título, pela matéria ou por um tema exato.
    consulta = consulta.or(`titulo.ilike.%${busca}%,materia.ilike.%${busca}%,temas.cs.{${busca.toLowerCase()}}`);
  }
  if (materia?.tipo === "idioma") consulta = consulta.eq("idioma_ensinado", materia.codigo).eq("materia", "");
  if (materia?.tipo === "materia") consulta = consulta.ilike("materia", materia.nome);
  if (nivel?.tipo === "etapa") consulta = consulta.eq("etapa", nivel.etapa);
  if (nivel?.tipo === "qecr") consulta = consulta.eq("nivel", nivel.nivel).eq("materia", "");
  if (tema) consulta = consulta.contains("temas", [tema]);

  const [{ data: atividades }, { data: todas }] = await Promise.all([
    consulta,
    // Só para montar o filtro "Matéria" com o que existe na biblioteca.
    supabase.from("atividade").select("materia, idioma_ensinado").eq("publicada", true).eq("publica", true).eq("idioma", idioma).limit(2000),
  ]);
  const opcoes = opcoesDeMateria(todas ?? []);
  if (materia?.tipo === "materia" && !opcoes.materias.some((m) => m.toLocaleLowerCase("pt-BR") === materia.nome.toLocaleLowerCase("pt-BR"))) {
    opcoes.materias.push(materia.nome);
  }
  const valorMateria =
    materia?.tipo === "materia"
      ? (opcoes.materias.find((m) => m.toLocaleLowerCase("pt-BR") === materia.nome.toLocaleLowerCase("pt-BR")) ?? materia.nome)
      : (materia?.valor ?? "");
  const filtrosAtuais = { busca, materia: valorMateria, nivel: nivel?.valor ?? "", tema };

  const ehProfessor = perfil?.papel === "professor";

  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-7xl px-4 pt-8 pb-16 sm:px-6 lg:px-8">
        <AbasBiblioteca atual="atividades" />
        <h1 className="text-3xl font-extrabold tracking-tight">Biblioteca de atividades</h1>
        <p className="mt-2 text-tinta-suave">
          Atividades que professores deixaram públicas. Qualquer pessoa pode fazer, com a correção na hora e a explicação de cada erro.
          {ehProfessor && " Professores podem copiar para adaptar e usar com a turma."}
        </p>

        <form className="mt-6 grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
          <input
            name="q"
            defaultValue={busca}
            placeholder="Buscar por título, matéria ou tema"
            aria-label="Buscar por título, matéria ou tema"
            className={campo}
          />
          <select name="materia" defaultValue={valorMateria} aria-label="Matéria" className={`${campo} sm:w-auto`}>
            <option value="">Todas as matérias</option>
            {opcoes.materias.length > 0 && (
              <optgroup label="Matérias">
                {opcoes.materias.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </optgroup>
            )}
            {opcoes.idiomas.length > 0 && (
              <optgroup label="Idiomas">
                {opcoes.idiomas.map((i) => (
                  <option key={i.valor} value={i.valor}>
                    {i.nome}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          <select name="nivel" defaultValue={nivel?.valor ?? ""} aria-label="Etapa ou nível" className={`${campo} sm:w-auto`}>
            <option value="">Todas as etapas</option>
            <optgroup label="Etapa de ensino">
              {opcoesDeEtapa.map((e) => (
                <option key={e.valor} value={e.valor}>
                  {e.nome}
                </option>
              ))}
            </optgroup>
            <optgroup label="Nível de idioma">
              {niveis.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </optgroup>
          </select>
          {tema && <input type="hidden" name="tema" value={tema} />}
          <button type="submit" className={botaoSecundario}>
            Filtrar
          </button>
        </form>

        {tema && (
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="text-tinta-suave">Tema:</span>
            <Link
              href={linkBiblioteca({ ...filtrosAtuais, tema: "" })}
              aria-label={`Tirar o filtro do tema ${tema}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-primaria-suave px-3 py-1 font-bold text-primaria hover:underline"
            >
              {tema}
              <Icone nome="errado" className="size-3.5" />
            </Link>
          </div>
        )}

        {atividades && atividades.length > 0 ? (
          <ul className="mt-6 space-y-3">
            {atividades.map((a) => {
              const total = (a.exercicio as unknown as { count: number }[])[0]?.count ?? 0;
              const minha = perfil?.id === a.professor_id;
              return (
                <li key={a.id} className="rounded-2xl border border-linha p-5">
                  <Link href={`/atividades/${a.id}`} className="block font-bold hover:text-primaria">
                    {a.titulo}
                  </Link>
                  <p className="mt-1 text-sm text-tinta-suave">
                    {etiquetasDaAtividade(a).join(" · ")} · {total} {total === 1 ? "exercício" : "exercícios"}
                  </p>
                  {(a.temas ?? []).length > 0 && (
                    <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Temas">
                      {a.temas.map((t: string) => (
                        <li key={t}>
                          <Link
                            href={linkBiblioteca({ ...filtrosAtuais, tema: t })}
                            className="inline-block rounded-full bg-suave px-2.5 py-0.5 text-xs font-bold text-tinta-suave hover:text-primaria"
                          >
                            {t}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    <Link href={`/atividades/${a.id}`} className="font-bold text-primaria hover:underline">
                      Fazer a atividade
                    </Link>
                    {ehProfessor && !minha && (
                      <form action={duplicarAtividade}>
                        <input type="hidden" name="id" value={a.id} />
                        <button type="submit" className="font-bold text-primaria hover:underline">
                          Copiar para minhas atividades
                        </button>
                      </form>
                    )}
                    {minha && <span className="text-tinta-suave">Sua atividade</span>}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-8 rounded-2xl border-2 border-dashed border-linha p-8 text-center">
            <p className="font-bold">Nenhuma atividade encontrada.</p>
            <p className="mt-1 text-sm text-tinta-suave">
              {busca || materia || nivel || tema ? "Tente outros filtros." : "Quando os professores marcarem atividades como públicas, elas aparecem aqui."}
            </p>
            <p className="mt-2 text-sm text-tinta-suave">{fmt((await obterDicionario()).biblioteca.soIdioma, { idioma: NOME_NATIVO[idioma] })}</p>
          </div>
        )}
      </main>
    </>
  );
}
