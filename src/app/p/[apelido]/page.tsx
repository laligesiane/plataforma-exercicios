import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { cache } from "react";
import { Avatar } from "@/components/Avatar";
import { Cabecalho } from "@/components/Cabecalho";
import { coresRedes, IconeRede } from "@/components/IconeRede";
import { etiquetasDaAtividade } from "@/lib/atividades/modelo";
import { urlDaFoto } from "@/lib/foto";
import { infoRedes, lerContato, MODALIDADES, REDES, tempoEnsinando, type Modalidade, type Rede } from "@/lib/paginaProfessor";
import { lerCorResumo } from "@/lib/resumos";
import { criarClienteServidor } from "@/lib/supabase/servidor";

type Params = { params: Promise<{ apelido: string }> };

type Pagina = {
  professor_id: string;
  apelido: string;
  nome: string;
  bio: string;
  materias: string;
  contato: string;
  publicada: boolean;
  // Campos da 0038: podem faltar enquanto o SQL não roda.
  destaque?: string;
  ensina_desde?: number | null;
  formacao?: string;
  modalidade?: string;
  cidade?: string;
  cor?: string;
} & Partial<Record<Rede, string>>;

const buscarPagina = cache(async (apelido: string) => {
  const supabase = await criarClienteServidor();
  // "*" para não quebrar se as colunas da 0038 ainda não existirem.
  const { data } = await supabase.from("pagina_professor").select("*").eq("apelido", apelido.toLowerCase()).maybeSingle<Pagina>();
  return data;
});

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const pagina = await buscarPagina((await params).apelido);
  if (!pagina) return { title: "Página não encontrada · Repasa" };
  return {
    title: `${pagina.nome} · Repasa`,
    description: pagina.destaque || pagina.materias || pagina.bio.slice(0, 160) || `Atividades de ${pagina.nome} na Repasa.`,
  };
}

const traco = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const Icone = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden {...traco}>
    {children}
  </svg>
);
const icones = {
  tempo: (
    <Icone>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Icone>
  ),
  aulas: (
    <Icone>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </Icone>
  ),
  cidade: (
    <Icone>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </Icone>
  ),
  formacao: (
    <Icone>
      <path d="m2 9 10-5 10 5-10 5z" />
      <path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5M22 9v6" />
    </Icone>
  ),
  email: (
    <Icone>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </Icone>
  ),
  site: (
    <Icone>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z" />
    </Icone>
  ),
};

function Bloco({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-linha p-5 sm:p-6">
      <h2 className="mb-3 text-lg font-extrabold tracking-tight">{titulo}</h2>
      {children}
    </section>
  );
}

export default async function PaginaDoProfessor({ params }: Params) {
  const pagina = await buscarPagina((await params).apelido);
  if (!pagina) notFound();

  const supabase = await criarClienteServidor();
  const [{ data: atividades }, { data: foto }] = await Promise.all([
    supabase
      .from("atividade")
      .select("id, titulo, nivel, categoria, materia, idioma_ensinado")
      .eq("professor_id", pagina.professor_id)
      .eq("publicada", true)
      .eq("publica", true)
      .order("atualizada_em", { ascending: false })
      .limit(30),
    supabase.rpc("foto_do_professor", { professor: pagina.professor_id }),
  ]);

  const contato = lerContato(pagina.contato);
  const redes = REDES.filter((r) => pagina[r]);
  const materias = pagina.materias.split(/[,;\n]/).map((m) => m.trim()).filter(Boolean);
  const formacao = (pagina.formacao ?? "").split("\n").map((f) => f.trim()).filter(Boolean);
  const experiencia = [
    { icone: icones.tempo, titulo: tempoEnsinando(pagina.ensina_desde), detalhe: pagina.ensina_desde ? `Começou em ${pagina.ensina_desde}` : null },
    { icone: icones.aulas, titulo: MODALIDADES[pagina.modalidade as Modalidade] ?? null, detalhe: null },
    { icone: icones.cidade, titulo: pagina.cidade || null, detalhe: null },
  ].filter((d) => d.titulo);

  return (
    <>
      <Cabecalho />
      {/* A página fica sempre na cor escolhida pelo professor, não na cor de quem visita. */}
      <main data-cores-repasa data-cor={lerCorResumo(pagina.cor)} className="mx-auto w-full max-w-3xl px-4 pt-10 pb-16">
        {!pagina.publicada && (
          <p className="mb-6 rounded-xl bg-aviso-fundo px-3.5 py-2.5 text-sm">
            Só você está vendo: a página está como rascunho. Marque &quot;Deixar a página no ar&quot; no{" "}
            <Link href="/professor/site" className="font-bold underline">
              Site do professor
            </Link>
            .
          </p>
        )}

        {/* Quem é e o que ensina: o foco da página. */}
        <header className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar nome={pagina.nome} foto={urlDaFoto(foto)} className="size-24 text-4xl sm:size-28" />
          <div className="min-w-0">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{pagina.nome}</h1>
            {pagina.destaque && <p className="mt-2 text-lg text-tinta-suave">{pagina.destaque}</p>}
          </div>
        </header>

        {materias.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-extrabold tracking-tight">O que ensina</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {materias.map((m) => (
                <li key={m} className="rounded-full bg-primaria-suave px-4 py-1.5 font-bold text-primaria">
                  {m}
                </li>
              ))}
            </ul>
          </section>
        )}

        {experiencia.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-extrabold tracking-tight">Experiência</h2>
            <ul className="mt-3 grid gap-3 sm:grid-cols-3">
              {experiencia.map((e) => (
                <li key={e.titulo} className="flex items-center gap-3 rounded-2xl border border-linha p-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primaria-suave text-primaria [&_svg]:size-5">{e.icone}</span>
                  <span>
                    <span className="block font-bold">{e.titulo}</span>
                    {e.detalhe && <span className="block text-sm text-tinta-suave">{e.detalhe}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {(pagina.bio || formacao.length > 0) && (
          <div className={`mt-8 grid gap-6 ${pagina.bio && formacao.length > 0 ? "sm:grid-cols-[3fr_2fr]" : ""}`}>
            {pagina.bio && (
              <Bloco titulo="Sobre">
                <p className="leading-relaxed whitespace-pre-line">{pagina.bio}</p>
              </Bloco>
            )}
            {formacao.length > 0 && (
              <Bloco titulo="Formação">
                <ul className="space-y-2.5">
                  {formacao.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm [&_svg]:text-primaria">
                      {icones.formacao}
                      {f}
                    </li>
                  ))}
                </ul>
              </Bloco>
            )}
          </div>
        )}

        <section className="mt-10">
          <h2 className="text-lg font-extrabold tracking-tight">Atividades para praticar</h2>
          {atividades && atividades.length > 0 ? (
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
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
            <p className="mt-3 rounded-2xl border border-dashed border-linha p-5 text-sm text-tinta-suave">
              Ainda não há atividades públicas por aqui.
            </p>
          )}
        </section>

        {(redes.length > 0 || contato) && (
          <section className="mt-10">
            <Bloco titulo="Contato">
              <ul className="grid gap-2 sm:grid-cols-2">
                {redes.map((rede) => {
                  const valor = pagina[rede]!;
                  return (
                    <li key={rede}>
                      <a
                        href={infoRedes[rede].link(valor)}
                        target="_blank"
                        rel="noopener nofollow"
                        className="flex items-center gap-3 rounded-2xl px-2 py-2 transition-colors hover:bg-suave"
                      >
                        <span className="grid size-9 shrink-0 place-items-center rounded-full text-white" style={{ background: coresRedes[rede] }}>
                          <IconeRede rede={rede} className="size-5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-xs font-bold text-tinta-suave">{infoRedes[rede].nome}</span>
                          <span className="block truncate font-bold">{infoRedes[rede].rotulo(valor)}</span>
                        </span>
                      </a>
                    </li>
                  );
                })}
                {contato && (
                  <li>
                    <ItemContato contato={contato} icone={contato.href?.startsWith("http") ? icones.site : icones.email} />
                  </li>
                )}
              </ul>
            </Bloco>
          </section>
        )}

        <p className="mt-10 text-center text-sm text-tinta-suave">
          Grátis e sem anúncios, com a correção na hora e a explicação de cada erro.
        </p>
      </main>
    </>
  );
}

function ItemContato({ contato, icone }: { contato: { texto: string; href?: string }; icone: ReactNode }) {
  const conteudo = (
    <>
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primaria text-white [&_svg]:size-5">{icone}</span>
      <span className="min-w-0">
        <span className="block text-xs font-bold text-tinta-suave">{contato.href?.startsWith("http") ? "Site" : "E-mail"}</span>
        <span className="block truncate font-bold">{contato.texto}</span>
      </span>
    </>
  );
  return contato.href ? (
    <a href={contato.href} rel="noopener nofollow" className="flex items-center gap-3 rounded-2xl px-2 py-2 transition-colors hover:bg-suave">
      {conteudo}
    </a>
  ) : (
    <span className="flex items-center gap-3 px-2 py-2">{conteudo}</span>
  );
}
