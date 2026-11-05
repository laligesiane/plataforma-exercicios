import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Cabecalho } from "@/components/Cabecalho";
import { etiquetasDaAtividade } from "@/lib/atividades/modelo";
import { lerContato } from "@/lib/paginaProfessor";
import { criarClienteServidor } from "@/lib/supabase/servidor";

type Params = { params: Promise<{ apelido: string }> };

const buscarPagina = cache(async (apelido: string) => {
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("pagina_professor")
    .select("professor_id, apelido, nome, bio, materias, contato, publicada")
    .eq("apelido", apelido.toLowerCase())
    .maybeSingle();
  return data;
});

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const pagina = await buscarPagina((await params).apelido);
  if (!pagina) return { title: "Página não encontrada · Repasa" };
  return {
    title: `${pagina.nome} · Repasa`,
    description: pagina.materias || pagina.bio.slice(0, 160) || `Atividades de ${pagina.nome} na Repasa.`,
  };
}

export default async function PaginaDoProfessor({ params }: Params) {
  const pagina = await buscarPagina((await params).apelido);
  if (!pagina) notFound();

  const supabase = await criarClienteServidor();
  const { data: atividades } = await supabase
    .from("atividade")
    .select("id, titulo, nivel, categoria, materia, idioma_ensinado")
    .eq("professor_id", pagina.professor_id)
    .eq("publicada", true)
    .eq("publica", true)
    .order("atualizada_em", { ascending: false })
    .limit(30);
  const contato = lerContato(pagina.contato);

  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-2xl px-4 pt-10 pb-16">
        {!pagina.publicada && (
          <p className="mb-6 rounded-xl bg-aviso-fundo px-3.5 py-2.5 text-sm">
            Só você está vendo: a página está como rascunho. Marque &quot;Deixar a página no ar&quot; no{" "}
            <Link href="/perfil" className="font-bold underline">
              seu perfil
            </Link>
            .
          </p>
        )}
        <div className="flex items-center gap-4">
          <span aria-hidden className="grid size-16 shrink-0 place-items-center rounded-full bg-primaria-suave text-2xl font-extrabold text-primaria">
            {pagina.nome.trim().charAt(0).toUpperCase()}
          </span>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">{pagina.nome}</h1>
            {pagina.materias && <p className="mt-1 text-tinta-suave">{pagina.materias}</p>}
          </div>
        </div>

        {pagina.bio && <p className="mt-6 leading-relaxed whitespace-pre-line">{pagina.bio}</p>}

        {contato && (
          <p className="mt-6 text-sm">
            <span className="font-bold">Contato: </span>
            {contato.href ? (
              <a href={contato.href} rel="noopener nofollow" className="font-bold text-primaria hover:underline">
                {contato.texto}
              </a>
            ) : (
              contato.texto
            )}
          </p>
        )}

        <h2 className="mt-10 text-xl font-extrabold tracking-tight">Atividades para praticar</h2>
        {atividades && atividades.length > 0 ? (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {atividades.map((a) => (
              <li key={a.id}>
                <Link href={`/atividades/${a.id}`} className="block h-full rounded-2xl border border-linha p-5 transition-colors hover:border-primaria">
                  <span className="block font-bold">{a.titulo}</span>
                  <span className="mt-1 block text-sm text-tinta-suave">{etiquetasDaAtividade(a).join(" · ")}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-2xl border border-dashed border-linha p-5 text-sm text-tinta-suave">
            Ainda não há atividades públicas por aqui.
          </p>
        )}

        <p className="mt-10 text-center text-sm text-tinta-suave">
          Grátis e sem anúncios, com a correção na hora e a explicação de cada erro.
        </p>
      </main>
    </>
  );
}
