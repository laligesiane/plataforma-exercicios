import Link from "next/link";
import { Cabecalho } from "@/components/Cabecalho";
import { tiposExercicio } from "@/lib/atividades/modelo";
import { aulasDemo } from "@/lib/exemplos/aulasDemo";
import { obterDicionario } from "@/i18n/servidor";

export async function generateMetadata() {
  return { title: (await obterDicionario()).experimente.tituloPagina };
}

export default async function Experimente() {
  const tx = (await obterDicionario()).experimente;
  return (
    <div className="flex min-h-screen flex-col">
      <Cabecalho />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-8 pb-16 sm:px-6 lg:px-8">
        <span className="rounded-full bg-primaria-suave px-3 py-1 text-xs font-bold text-primaria">{tx.selo}</span>
        <h1 className="mt-3 text-3xl leading-tight font-extrabold tracking-tight text-balance sm:text-4xl">
          {tx.titulo}
        </h1>
        <p className="mt-3 max-w-prose text-tinta-suave">
          {tx.texto}
        </p>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {aulasDemo.map((aula) => (
            <li key={aula.slug}>
              <Link
                href={`/experimente/${aula.slug}`}
                className="group flex h-full items-start gap-3.5 rounded-2xl border-2 border-linha bg-fundo p-4 transition-colors hover:border-primaria focus-visible:border-primaria focus-visible:outline-none"
              >
                <span
                  aria-hidden
                  className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primaria-suave text-base font-extrabold text-primaria"
                >
                  {aula.sigla}
                </span>
                <span>
                  <span className="block text-lg font-extrabold group-hover:text-primaria">{aula.materia}</span>
                  <span className="mt-0.5 block text-sm text-tinta-suave">{aula.chamada}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <section className="mt-10 rounded-2xl bg-suave p-5">
          <h2 className="font-bold">{tx.emCadaAula}</h2>
          <ul className="mt-3 flex flex-wrap gap-2 text-sm">
            {Object.values(tiposExercicio).map((tipo) => (
              <li key={tipo} className="rounded-full bg-fundo px-3 py-1 font-semibold text-tinta-suave">
                {tipo}
              </li>
            ))}
            <li className="rounded-full bg-fundo px-3 py-1 font-semibold text-tinta-suave">{tx.comImagem}</li>
          </ul>
        </section>
      </main>

      <footer className="border-t border-linha py-6 text-center text-xs text-tinta-suave">{tx.versaoTeste}</footer>
    </div>
  );
}
