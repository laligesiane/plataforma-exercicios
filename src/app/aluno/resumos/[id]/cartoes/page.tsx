import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Cabecalho } from "@/components/Cabecalho";
import { cartoesDoDocumento } from "@/lib/documento/cartoes";
import { exigirPapel } from "@/lib/perfil";
import { camposResumo, documentoDoResumo, tituloResumo, type Resumo } from "@/lib/resumos";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { EstudarCartoes } from "./EstudarCartoes";

export const metadata: Metadata = { title: "Cartões de estudo · Repasa" };

export default async function CartoesDoResumo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await exigirPapel("aluno");
  const supabase = await criarClienteServidor();
  const { data } = await supabase.from("resumo").select(camposResumo).eq("id", id).maybeSingle();
  if (!data) notFound();
  const resumo = data as unknown as Resumo;
  const cartoes = cartoesDoDocumento(documentoDoResumo(resumo));

  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-xl px-4 pt-8 pb-16">
        <Link href={`/aluno/resumos/${id}`} className="text-sm font-bold text-primaria hover:underline">
          ← Voltar ao resumo
        </Link>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight">Cartões: {tituloResumo(resumo)}</h1>
        <p className="mt-2 mb-6 text-tinta-suave">Feitos dos títulos e dos trechos em negrito do resumo.</p>
        {cartoes.length > 0 ? (
          <EstudarCartoes cartoes={cartoes} />
        ) : (
          <p className="rounded-2xl border border-dashed border-linha p-6 text-center text-sm text-tinta-suave">
            Este resumo ainda não tem títulos com texto embaixo nem trechos em negrito. Use Título e Negrito no editor para gerar os cartões.
          </p>
        )}
      </main>
    </>
  );
}
