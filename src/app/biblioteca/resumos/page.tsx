import type { Metadata } from "next";
import { fmt, NOME_NATIVO } from "@/i18n/config";
import { obterDicionario, obterIdioma } from "@/i18n/servidor";
import Link from "next/link";
import { AbasBiblioteca } from "@/components/AbasBiblioteca";
import { Cabecalho } from "@/components/Cabecalho";
import { botaoSecundario, campo } from "@/components/ui/estilos";
import { Icone } from "@/components/jogos/Icones";
import { lerFiltros, linkBibliotecaResumos, opcoesDeMateria, type ParametrosBiblioteca } from "@/lib/atividades/biblioteca";
import { nomeIdioma } from "@/lib/idiomas";
import { tituloResumo, type Resumo } from "@/lib/resumos";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export const metadata: Metadata = {
  title: "Biblioteca de resumos · Repasa",
  description: "Resumos e mapas mentais que professores deixaram públicos na Repasa, de qualquer matéria. Grátis e sem anúncios.",
  alternates: { canonical: "/biblioteca/resumos" },
};

type Linha = Pick<Resumo, "id" | "titulo" | "mapa" | "temas" | "atualizado_em"> & { materia: string; idioma_ensinado: string | null };

export default async function BibliotecaDeResumos({ searchParams }: { searchParams: Promise<ParametrosBiblioteca> }) {
  const { busca, materia, tema } = lerFiltros(await searchParams);

  const supabase = await criarClienteServidor();
  const idioma = await obterIdioma();
  // Só os públicos e publicados (as regras do banco também garantem).
  let consulta = supabase
    .from("resumo")
    .select("id, titulo, mapa, temas, materia, idioma_ensinado, atualizado_em")
    .eq("publicado", true)
    .eq("publico", true)
    // Só o que está no idioma de quem visita (0041).
    .eq("idioma", idioma)
    .order("atualizado_em", { ascending: false })
    .limit(60);
  if (busca) {
    // A busca acha pelo título, pelo texto, pela matéria ou por um tema exato.
    consulta = consulta.or(`titulo.ilike.%${busca}%,texto.ilike.%${busca}%,materia.ilike.%${busca}%,temas.cs.{${busca.toLowerCase()}}`);
  }
  if (materia?.tipo === "idioma") consulta = consulta.eq("idioma_ensinado", materia.codigo).eq("materia", "");
  if (materia?.tipo === "materia") consulta = consulta.ilike("materia", materia.nome);
  if (tema) consulta = consulta.contains("temas", [tema]);

  const [{ data }, { data: todas }] = await Promise.all([
    consulta,
    // Só para montar o filtro "Matéria" com o que existe na biblioteca.
    supabase.from("resumo").select("materia, idioma_ensinado").eq("publicado", true).eq("publico", true).eq("idioma", idioma).limit(2000),
  ]);
  const resumos = (data ?? []) as unknown as Linha[];
  const opcoes = opcoesDeMateria(todas ?? []);
  if (materia?.tipo === "materia" && !opcoes.materias.some((m) => m.toLocaleLowerCase("pt-BR") === materia.nome.toLocaleLowerCase("pt-BR"))) {
    opcoes.materias.push(materia.nome);
  }
  const valorMateria =
    materia?.tipo === "materia"
      ? (opcoes.materias.find((m) => m.toLocaleLowerCase("pt-BR") === materia.nome.toLocaleLowerCase("pt-BR")) ?? materia.nome)
      : (materia?.valor ?? "");
  const filtrosAtuais = { busca, materia: valorMateria, tema };

  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-7xl px-4 pt-8 pb-16 sm:px-6 lg:px-8">
        <AbasBiblioteca atual="resumos" />
        <h1 className="text-3xl font-extrabold tracking-tight">Biblioteca de resumos</h1>
        <p className="mt-2 text-tinta-suave">Resumos e mapas mentais que professores deixaram públicos. Qualquer pessoa pode ler, sem login.</p>

        <form className="mt-6 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
          <input name="q" defaultValue={busca} placeholder="Buscar por título, assunto ou tema" aria-label="Buscar por título, assunto ou tema" className={campo} />
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
          {tema && <input type="hidden" name="tema" value={tema} />}
          <button type="submit" className={botaoSecundario}>
            Filtrar
          </button>
        </form>

        {tema && (
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="text-tinta-suave">Tema:</span>
            <Link
              href={linkBibliotecaResumos({ ...filtrosAtuais, tema: "" })}
              aria-label={`Tirar o filtro do tema ${tema}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-primaria-suave px-3 py-1 font-bold text-primaria hover:underline"
            >
              {tema}
              <Icone nome="errado" className="size-3.5" />
            </Link>
          </div>
        )}

        {resumos.length > 0 ? (
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {resumos.map((r) => {
              const sobre = r.materia?.trim() || (r.idioma_ensinado ? nomeIdioma(r.idioma_ensinado) : "");
              return (
                <li key={r.id} className="rounded-2xl border border-linha p-5">
                  <Link href={`/resumos/${r.id}`} className="block font-bold hover:text-primaria">
                    {tituloResumo(r)}
                  </Link>
                  {sobre && (
                    <Link
                      href={linkBibliotecaResumos({ ...filtrosAtuais, materia: r.materia?.trim() || `idioma:${r.idioma_ensinado}` })}
                      className="mt-1 inline-block text-sm text-tinta-suave hover:text-primaria"
                    >
                      {sobre}
                    </Link>
                  )}
                  {(r.temas ?? []).length > 0 && (
                    <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Temas">
                      {(r.temas ?? []).map((t) => (
                        <li key={t}>
                          <Link
                            href={linkBibliotecaResumos({ ...filtrosAtuais, tema: t })}
                            className="inline-block rounded-full bg-suave px-2.5 py-0.5 text-xs font-bold text-tinta-suave hover:text-primaria"
                          >
                            {t}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                  <Link href={`/resumos/${r.id}`} className="mt-3 inline-block text-sm font-bold text-primaria hover:underline">
                    Ler o resumo
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-8 rounded-2xl border-2 border-dashed border-linha p-8 text-center">
            <p className="font-bold">Nenhum resumo encontrado.</p>
            <p className="mt-1 text-sm text-tinta-suave">
              {busca || materia || tema ? "Tente outros filtros." : "Quando os professores marcarem resumos como públicos, eles aparecem aqui."}
            </p>
            <p className="mt-2 text-sm text-tinta-suave">{fmt((await obterDicionario()).biblioteca.soIdioma, { idioma: NOME_NATIVO[idioma] })}</p>
          </div>
        )}
      </main>
    </>
  );
}
