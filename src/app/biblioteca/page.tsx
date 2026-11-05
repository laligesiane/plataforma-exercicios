import type { Metadata } from "next";
import Link from "next/link";
import { duplicarAtividade } from "@/app/professor/atividades/actions";
import { Cabecalho } from "@/components/Cabecalho";
import { botaoSecundario, campo } from "@/components/ui/estilos";
import { etiquetasDaAtividade, niveis } from "@/lib/atividades/modelo";
import { idiomas } from "@/lib/idiomas";
import { obterPerfil } from "@/lib/perfil";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export const metadata: Metadata = {
  title: "Biblioteca de atividades · Repasa",
  description: "Atividades públicas feitas por professores na Repasa, com correção na hora e a explicação de cada erro. Grátis e sem anúncios.",
};

type Filtros = { q?: string; idioma?: string; nivel?: string; materia?: string };

export default async function Biblioteca({ searchParams }: { searchParams: Promise<Filtros> }) {
  const filtros = await searchParams;
  const busca = (filtros.q ?? "").trim().slice(0, 80);
  const idioma = filtros.idioma && filtros.idioma in idiomas ? filtros.idioma : "";
  const nivel = filtros.nivel && (niveis as readonly string[]).includes(filtros.nivel) ? filtros.nivel : "";
  const materia = (filtros.materia ?? "").trim().slice(0, 60);

  const supabase = await criarClienteServidor();
  const perfil = await obterPerfil();
  let consulta = supabase
    .from("atividade")
    .select("id, titulo, nivel, categoria, materia, idioma_ensinado, professor_id, exercicio(count)")
    .eq("publicada", true)
    .eq("publica", true)
    .order("atualizada_em", { ascending: false })
    .limit(60);
  if (busca) consulta = consulta.ilike("titulo", `%${busca.replace(/[%_]/g, "")}%`);
  if (idioma) consulta = consulta.eq("idioma_ensinado", idioma);
  if (nivel) consulta = consulta.eq("nivel", nivel).eq("materia", "");
  if (materia) consulta = consulta.ilike("materia", materia.replace(/[%_]/g, ""));
  const { data: atividades } = await consulta;

  const ehProfessor = perfil?.papel === "professor";

  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-3xl px-4 pt-8 pb-16">
        <h1 className="text-3xl font-extrabold tracking-tight">Biblioteca de atividades</h1>
        <p className="mt-2 text-tinta-suave">
          Atividades que professores deixaram públicas. Qualquer pessoa pode fazer, com a correção na hora e a explicação de cada erro.
          {ehProfessor && " Professores podem copiar para adaptar e usar com a turma."}
        </p>

        <form className="mt-6 grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
          <input name="q" defaultValue={busca} placeholder="Buscar pelo título" aria-label="Buscar pelo título" className={campo} />
          <select name="idioma" defaultValue={idioma} aria-label="Idioma" className={`${campo} sm:w-auto`}>
            <option value="">Todos os idiomas</option>
            {Object.entries(idiomas).map(([codigo, nome]) => (
              <option key={codigo} value={codigo}>
                {nome}
              </option>
            ))}
          </select>
          <select name="nivel" defaultValue={nivel} aria-label="Nível" className={`${campo} sm:w-auto`}>
            <option value="">Todos os níveis</option>
            {niveis.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <button type="submit" className={botaoSecundario}>
            Filtrar
          </button>
        </form>

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
              {busca || idioma || nivel || materia ? "Tente outros filtros." : "Quando os professores marcarem atividades como públicas, elas aparecem aqui."}
            </p>
          </div>
        )}
      </main>
    </>
  );
}
