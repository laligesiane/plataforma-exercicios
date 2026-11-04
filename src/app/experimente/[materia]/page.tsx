import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Cabecalho } from "@/components/Cabecalho";
import { aulaDemo, aulasDemo } from "@/lib/exemplos/aulasDemo";
import { ResolverDemo } from "./ResolverDemo";

type Params = { params: Promise<{ materia: string }> };

export function generateStaticParams() {
  return aulasDemo.map((a) => ({ materia: a.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const aula = aulaDemo((await params).materia);
  return { title: aula ? `${aula.materia}: aula de demonstração · Repasa` : "Repasa" };
}

export default async function AulaDeDemonstracao({ params }: Params) {
  const aula = aulaDemo((await params).materia);
  if (!aula) notFound();
  const outras = aulasDemo.filter((a) => a.slug !== aula.slug);

  return (
    <div className="flex min-h-screen flex-col">
      <Cabecalho />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-8 pb-16">
        <Link href="/experimente" className="text-sm font-bold text-primaria hover:underline">
          ← Trocar de matéria
        </Link>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
          <span className="rounded-full bg-primaria-suave px-3 py-1 text-primaria">{aula.materia}</span>
          <span className="rounded-full bg-suave px-3 py-1 text-tinta-suave">Demonstração</span>
        </div>
        <h1 className="mt-3 text-3xl leading-tight font-extrabold tracking-tight text-balance sm:text-4xl" lang={aula.lang}>
          {aula.titulo}
        </h1>
        <p className="mt-3 max-w-prose text-tinta-suave">{aula.explicacao}</p>
        <p className="mt-2 text-sm text-tinta-suave">Você está sem login, então nada fica salvo.</p>

        <div className="mt-8">
          <ResolverDemo exercicios={aula.exercicios} />
        </div>

        <nav aria-label="Outras matérias" className="mt-12 border-t border-linha pt-6">
          <p className="text-sm font-bold">Experimente outra matéria</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {outras.map((a) => (
              <Link
                key={a.slug}
                href={`/experimente/${a.slug}`}
                className="rounded-full border-2 border-linha px-4 py-1.5 text-sm font-bold hover:border-primaria hover:text-primaria"
              >
                {a.materia}
              </Link>
            ))}
          </div>
        </nav>
      </main>

      <footer className="border-t border-linha py-6 text-center text-xs text-tinta-suave">Versão de teste</footer>
    </div>
  );
}
