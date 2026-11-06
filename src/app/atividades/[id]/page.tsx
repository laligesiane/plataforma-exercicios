import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Cabecalho } from "@/components/Cabecalho";
import { CabecalhoAtividade } from "@/components/exercicios/CabecalhoAtividade";
import { carregarAtividade } from "@/lib/atividades/carregar";
import { ehUuid } from "@/lib/atividades/modelo";
import { montarProducoes, type LinhaProducao } from "@/lib/atividades/producoes";
import type { ProducaoSalva } from "@/components/exercicios/Producao";
import type { DuvidaSalva } from "@/components/exercicios/NaoEntendi";
import { nomeIdioma } from "@/lib/idiomas";
import { obterPerfil } from "@/lib/perfil";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { obterDicionario } from "@/i18n/servidor";
import { ResolverAtividade } from "./ResolverAtividade";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const carregada = ehUuid(id) ? await carregarAtividade(id) : null;
  if (!carregada) return { title: "Repasa", robots: { index: false } };
  const { atividade } = carregada;
  const sobre = atividade.materia?.trim() || (atividade.idioma_ensinado ? nomeIdioma(atividade.idioma_ensinado) : "estudo");
  return {
    title: `${atividade.titulo} · Repasa`,
    description: `Atividade de ${sobre} com correção na hora e a explicação de cada erro. Grátis e sem anúncios, na Repasa.`,
    alternates: { canonical: `/atividades/${id}` },
    // Só atividade pública e publicada entra no Google; as de turma ficam fora.
    robots: atividade.publica && atividade.publicada ? undefined : { index: false, follow: false },
  };
}

export default async function PaginaAtividade({ params }: Params) {
  const { id } = await params;
  if (!ehUuid(id)) notFound();

  const [perfil, carregada] = await Promise.all([obterPerfil(), carregarAtividade(id)]);
  if (!carregada) {
    // Sem login, uma atividade de turma não aparece: manda entrar antes de dizer que não existe.
    if (!perfil) redirect(`/entrar?proximo=/atividades/${id}`);
    notFound();
  }

  const { atividade, exercicios } = carregada;
  const tx = (await obterDicionario()).exercicio;
  const ehDono = perfil?.id === atividade.professor_id;

  // Só salva respostas de quem é aluno de uma turma que recebeu a atividade.
  let salvar = false;
  const anteriores: Record<string, string> = {};
  const primeiras: Record<string, boolean> = {};
  let producoes: Record<string, ProducaoSalva> = {};
  const duvidas: Record<string, DuvidaSalva[]> = {};
  if (perfil?.papel === "aluno") {
    const supabase = await criarClienteServidor();
    const temProducao = exercicios.some((e) => e.tipo === "producao");
    const [{ count }, { data: respostas }, { data: linhas }, { data: duvidasDb }] = await Promise.all([
      supabase.from("atividade_turma").select("turma_id", { count: "exact", head: true }).eq("atividade_id", id),
      supabase.from("resposta").select("item_id, valor, status").eq("atividade_id", id).eq("aluno_id", perfil.id).order("criada_em"),
      temProducao
        ? supabase
            .from("producao")
            .select("item_id, texto, audio, enviada_em, correcao(avaliacao, comentario, corrigida_em)")
            .eq("atividade_id", id)
            .eq("aluno_id", perfil.id)
        : Promise.resolve({ data: [] }),
      supabase.from("duvida").select("id, exercicio_id, texto, resposta, criada_em").eq("atividade_id", id).eq("aluno_id", perfil.id).order("criada_em"),
    ]);
    for (const { exercicio_id, ...d } of duvidasDb ?? []) (duvidas[exercicio_id] ??= []).push(d as DuvidaSalva);
    producoes = Object.fromEntries(await montarProducoes(supabase, (linhas ?? []) as unknown as LinhaProducao[]));
    salvar = (count ?? 0) > 0;
    for (const r of respostas ?? []) {
      anteriores[r.item_id] = r.valor;
      if (!(r.item_id in primeiras)) primeiras[r.item_id] = r.status !== "errado";
    }
  }

  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-7xl px-4 pt-8 pb-16 sm:px-6 lg:px-8">
        {ehDono && (
          <p className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-suave px-3.5 py-2.5 text-sm">
            <span>{atividade.publicada ? tx.comoAluno : tx.rascunho}</span>
            <Link href={`/professor/atividades/${id}`} className="font-bold text-primaria hover:underline">
              {tx.editar}
            </Link>
          </p>
        )}
        <CabecalhoAtividade atividade={atividade} />
        {!perfil && (
          <p className="mt-4 text-sm text-tinta-suave">
            {tx.semLogin}{" "}
            <Link href={`/entrar?proximo=/atividades/${id}`} className="font-bold text-primaria hover:underline">
              {tx.entrar}
            </Link>
          </p>
        )}
        <div className="mt-6">
          <ResolverAtividade
            atividadeId={id}
            exercicios={exercicios}
            respostasAnteriores={anteriores}
            primeirasAnteriores={primeiras}
            salvar={salvar}
            producoes={producoes}
            duvidas={duvidas}
            // Matéria (História, Matemática...) é escrita em português: o botão de ouvir lê em português.
            idioma={atividade.materia?.trim() ? "pt" : atividade.idioma_ensinado}
          />
        </div>
      </main>
    </>
  );
}
