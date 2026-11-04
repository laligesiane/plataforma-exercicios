import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Cabecalho } from "@/components/Cabecalho";
import { CabecalhoAtividade } from "@/components/exercicios/CabecalhoAtividade";
import { carregarAtividade } from "@/lib/atividades/carregar";
import { ehUuid } from "@/lib/atividades/modelo";
import { obterPerfil } from "@/lib/perfil";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { ResolverAtividade } from "./ResolverAtividade";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const carregada = ehUuid(id) ? await carregarAtividade(id) : null;
  return { title: carregada ? `${carregada.atividade.titulo} · Repasa` : "Repasa" };
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
  const ehDono = perfil?.id === atividade.professor_id;

  // Só salva respostas de quem é aluno de uma turma que recebeu a atividade.
  let salvar = false;
  const anteriores: Record<string, string> = {};
  const primeiras: Record<string, boolean> = {};
  if (perfil?.papel === "aluno") {
    const supabase = await criarClienteServidor();
    const [{ count }, { data: respostas }] = await Promise.all([
      supabase.from("atividade_turma").select("turma_id", { count: "exact", head: true }).eq("atividade_id", id),
      supabase.from("resposta").select("item_id, valor, status").eq("atividade_id", id).eq("aluno_id", perfil.id).order("criada_em"),
    ]);
    salvar = (count ?? 0) > 0;
    for (const r of respostas ?? []) {
      anteriores[r.item_id] = r.valor;
      if (!(r.item_id in primeiras)) primeiras[r.item_id] = r.status !== "errado";
    }
  }

  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-3xl px-4 pt-8 pb-16">
        {ehDono && (
          <p className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-suave px-3.5 py-2.5 text-sm">
            <span>{atividade.publicada ? "Você está vendo sua atividade como o aluno vê." : "Rascunho: só você vê esta página."}</span>
            <Link href={`/professor/atividades/${id}`} className="font-bold text-primaria hover:underline">
              Editar
            </Link>
          </p>
        )}
        <CabecalhoAtividade atividade={atividade} />
        {!perfil && (
          <p className="mt-4 text-sm text-tinta-suave">
            Você está fazendo sem login, então as respostas não ficam salvas.{" "}
            <Link href={`/entrar?proximo=/atividades/${id}`} className="font-bold text-primaria hover:underline">
              Entrar
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
          />
        </div>
      </main>
    </>
  );
}
