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
  const detalhes = [
    { icone: icones.tempo, texto: tempoEnsinando(pagina.ensina_desde) },
    { icone: icones.aulas, texto: MODALIDADES[pagina.modalidade as Modalidade] ?? null },
    { icone: icones.cidade, texto: pagina.cidade || null },
  ].filter((d) => d.texto);

  return (
    <>
      <Cabecalho />
      {/* A página fica sempre na cor escolhida pelo professor, não na cor de quem visita. */}
      <main data-cores-repasa data-cor={lerCorResumo(pagina.cor)} className="mx-auto w-full max-w-3xl px-4 pt-6 pb-16">
        {!pagina.publicada && (
          <p className="mb-6 rounded-xl bg-aviso-fundo px-3.5 py-2.5 text-sm">
            Só você está vendo: a página está como rascunho. Marque &quot;Deixar a página no ar&quot; no{" "}
            <Link href="/perfil" className="font-bold underline">
              seu perfil
            </Link>
            .
          </p>
        )}

        <div className="overflow-hidden rounded-3xl border border-linha">
          <div className="h-28 bg-primaria-suave sm:h-36" aria-hidden>
            <svg viewBox="0 0 400 100" preserveAspectRatio="none" className="size-full text-primaria opacity-20">
              <path d="M0 70 C80 30 160 100 240 60 S360 20 400 40 V100 H0z" fill="currentColor" />
            </svg>
          </div>
          <div className="px-5 pb-6 sm:px-8">
            <div className="-mt-12 sm:-mt-14">
              <Avatar nome={pagina.nome} foto={urlDaFoto(foto)} className="size-24 text-4xl ring-4 ring-fundo sm:size-28" />
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight">{pagina.nome}</h1>
            {pagina.destaque && <p className="mt-1 text-lg text-tinta-suave">{pagina.destaque}</p>}

            {detalhes.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2">
                {detalhes.map((d) => (
                  <li key={d.texto} className="flex items-center gap-1.5 rounded-full bg-suave px-3 py-1 text-sm font-semibold [&_svg]:text-primaria">
                    {d.icone}
                    {d.texto}
                  </li>
                ))}
              </ul>
            )}

            {(redes.length > 0 || contato) && (
              <ul className="mt-5 flex flex-wrap gap-2">
                {redes.map((rede) => {
                  const valor = pagina[rede]!;
                  return (
                    <li key={rede}>
                      <a
                        href={infoRedes[rede].link(valor)}
                        target="_blank"
                        rel="noopener nofollow"
                        className="flex items-center gap-2 rounded-full border-2 border-linha py-1 pr-3.5 pl-1 text-sm font-bold transition-colors hover:border-tinta"
                      >
                        <span className="grid size-7 place-items-center rounded-full text-white" style={{ background: coresRedes[rede] }}>
                          <IconeRede rede={rede} className="size-4" />
                        </span>
                        <span className="sr-only">{infoRedes[rede].nome}: </span>
                        {infoRedes[rede].rotulo(valor)}
                      </a>
                    </li>
                  );
                })}
                {contato && (
                  <li>
                    {contato.href ? (
                      <a
                        href={contato.href}
                        rel="noopener nofollow"
                        className="flex items-center gap-2 rounded-full border-2 border-linha py-1 pr-3.5 pl-1 text-sm font-bold transition-colors hover:border-tinta"
                      >
                        <span className="grid size-7 place-items-center rounded-full bg-primaria text-white">
                          {contato.href.startsWith("mailto:") ? icones.email : icones.site}
                        </span>
                        {contato.texto}
                      </a>
                    ) : (
                      <span className="flex items-center gap-2 rounded-full border-2 border-linha py-1 pr-3.5 pl-1 text-sm font-bold">
                        <span className="grid size-7 place-items-center rounded-full bg-primaria text-white">{icones.email}</span>
                        {contato.texto}
                      </span>
                    )}
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-6">
          {pagina.bio && (
            <Bloco titulo="Sobre">
              <p className="leading-relaxed whitespace-pre-line">{pagina.bio}</p>
            </Bloco>
          )}

          {(materias.length > 0 || formacao.length > 0) && (
            <div className="grid gap-6 sm:grid-cols-2">
              {materias.length > 0 && (
                <Bloco titulo="O que ensina">
                  <ul className="flex flex-wrap gap-2">
                    {materias.map((m) => (
                      <li key={m} className="rounded-full bg-primaria-suave px-3 py-1 text-sm font-bold text-primaria">
                        {m}
                      </li>
                    ))}
                  </ul>
                </Bloco>
              )}
              {formacao.length > 0 && (
                <Bloco titulo="Formação">
                  <ul className="space-y-2">
                    {formacao.map((f) => (
                      <li key={f} className="flex gap-2 text-sm [&_svg]:mt-0.5 [&_svg]:text-primaria">
                        {icones.formacao}
                        {f}
                      </li>
                    ))}
                  </ul>
                </Bloco>
              )}
            </div>
          )}

          <section>
            <h2 className="text-xl font-extrabold tracking-tight">Atividades para praticar</h2>
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
          </section>
        </div>

        <p className="mt-10 text-center text-sm text-tinta-suave">
          Grátis e sem anúncios, com a correção na hora e a explicação de cada erro.
        </p>
      </main>
    </>
  );
}
