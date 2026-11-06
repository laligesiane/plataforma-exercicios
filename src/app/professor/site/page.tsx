import type { Metadata } from "next";
import Link from "next/link";
import { Cabecalho } from "@/components/Cabecalho";
import { exigirPapel } from "@/lib/perfil";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { FormularioPagina, type PaginaSalva } from "./FormularioPagina";

export const metadata: Metadata = { title: "Site do professor · Repasa" };

/** Onde o professor monta a página pública dele (repasa.com.br/p/apelido). Fica fora do Perfil. */
export default async function SiteDoProfessor() {
  const perfil = await exigirPapel("professor");
  const supabase = await criarClienteServidor();
  // "*" para não quebrar se as colunas da 0038 ainda não existirem.
  const { data: pagina } = await supabase.from("pagina_professor").select("*").eq("professor_id", perfil.id).maybeSingle<PaginaSalva>();

  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-2xl px-4 pt-10 pb-16">
        <h1 className="text-3xl font-extrabold tracking-tight">Site do professor</h1>
        <p className="mt-1 text-tinta-suave">
          Sua página pública para divulgar as aulas: o que você ensina, sua experiência, suas atividades e como falar com você.
          {pagina?.publicada && (
            <>
              {" "}
              Ela está no ar em{" "}
              <Link href={`/p/${pagina.apelido}`} className="font-bold text-primaria hover:underline">
                repasa.com.br/p/{pagina.apelido}
              </Link>
              .
            </>
          )}
        </p>
        <section className="mt-6 rounded-3xl border border-linha bg-fundo p-5 sm:p-6">
          <FormularioPagina pagina={pagina} nomePadrao={perfil.nome ?? ""} />
        </section>
      </main>
    </>
  );
}
