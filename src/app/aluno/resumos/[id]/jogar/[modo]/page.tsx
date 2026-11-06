import { obterDicionario } from "@/i18n/servidor";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Cabecalho } from "@/components/Cabecalho";
import { Icone } from "@/components/jogos/Icones";
import { Jogo } from "@/components/jogos/Jogo";
import { cartoesUteis, infoDoJogo } from "@/lib/documento/jogos";
import { carregarCartoes } from "../dados";

export async function generateMetadata({ params }: { params: Promise<{ modo: string }> }): Promise<Metadata> {
  const { modo } = await params;
  const t = (await obterDicionario()).jogos;
  const info = infoDoJogo(modo);
  return { title: `${info ? t.lista[info.modo].nome : t.jogo} · Repasa` };
}

export default async function JogarResumo({ params }: { params: Promise<{ id: string; modo: string }> }) {
  const { id, modo } = await params;
  const info = infoDoJogo(modo);
  if (!info) notFound();
  const { titulo, cartoes } = await carregarCartoes(id);
  const t = (await obterDicionario()).jogos;
  // Sem cartões suficientes para este jogo, volta para a lista, que explica o que falta.
  if (cartoesUteis(info.modo, cartoes) < info.minimo) redirect(`/aluno/resumos/${id}/jogar`);

  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-xl px-4 pt-8 pb-16">
        <Link href={`/aluno/resumos/${id}/jogar`} className="text-sm font-bold text-primaria hover:underline">
          ← {t.outros}
        </Link>
        <h1 className="mt-3 flex items-center gap-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
          <Icone nome={info.modo} className="size-7 text-primaria" /> {t.lista[info.modo].nome}
        </h1>
        <p className="mt-1 mb-5 text-sm text-tinta-suave">{titulo}</p>
        <Jogo modo={info.modo} cartoes={cartoes} resumoId={id} />
      </main>
    </>
  );
}
