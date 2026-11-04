import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Documento } from "@/components/Documento";
import { MapaMental } from "@/components/MapaMental";
import { formatarData, tituloAula } from "@/lib/aulas";
import { documentoTemConteudo } from "@/lib/documento";
import { validarMapa } from "@/lib/mapas";
import { obterPerfil } from "@/lib/perfil";
import { camposResumo, documentoDoResumo, tituloResumo, type Resumo } from "@/lib/resumos";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { BarraImpressao } from "./BarraImpressao";

type Incluir = "resumo" | "mapa" | "tudo";

async function carregar(id: string) {
  const supabase = await criarClienteServidor();
  // As regras de acesso do banco garantem que só aparece o que a pessoa pode ver.
  const { data } = await supabase
    .from("resumo")
    .select(`${camposResumo}, turma(nome), aula(data, titulo), materia(nome)`)
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const data = await carregar((await params).id);
  // O título vira o nome sugerido do arquivo PDF.
  return { title: data ? `${tituloResumo(data as unknown as Resumo)} – Repasa` : "Resumo – Repasa" };
}

export default async function ResumoEmPdf({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ incluir?: string }>;
}) {
  const [{ id }, { incluir: pedido }] = await Promise.all([params, searchParams]);
  if (!(await obterPerfil())) redirect(`/entrar?proximo=/resumos/${id}/pdf`);
  const data = await carregar(id);
  if (!data) notFound();

  const resumo = data as unknown as Resumo;
  const turma = data.turma as unknown as { nome: string } | null;
  const aula = data.aula as unknown as { data: string; titulo: string } | null;
  const materia = data.materia as unknown as { nome: string } | null;
  const subtitulo = [
    materia?.nome,
    turma?.nome,
    aula && (aula.titulo.trim() ? `${aula.titulo} · ${formatarData(aula.data)}` : tituloAula(aula)),
  ]
    .filter(Boolean)
    .join(" · ");

  const incluir: Incluir = pedido === "resumo" || pedido === "mapa" ? pedido : "tudo";
  const doc = documentoDoResumo(resumo);
  const mapa = validarMapa(resumo.mapa);
  const temTexto = documentoTemConteudo(doc);
  const temMapa = !!mapa && (!!mapa.centro || mapa.ramos.length > 0);
  const mostrarTexto = temTexto && incluir !== "mapa";
  const mostrarMapa = temMapa && incluir !== "resumo";

  return (
    <>
      <BarraImpressao />
      <main className="mx-auto w-full max-w-3xl px-4 pt-8 pb-16 print:max-w-none print:p-0">
        <p className="text-sm font-extrabold text-primaria">Repasa</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{tituloResumo(resumo)}</h1>
        {subtitulo && <p className="mt-1 text-tinta-suave">{subtitulo}</p>}

        {mostrarTexto && (
          <div className="mt-8">
            <Documento doc={doc} />
          </div>
        )}

        {mostrarMapa && (
          <section className={mostrarTexto ? "folha-paisagem mt-10 print:mt-0" : "folha-paisagem mt-8 print:mt-4"}>
            {mostrarTexto && <h2 className="mb-4 text-xl font-extrabold">Mapa mental</h2>}
            <MapaMental mapa={mapa!} titulo={tituloResumo(resumo)} impressao />
          </section>
        )}

        {!mostrarTexto && !mostrarMapa && (
          <p className="mt-8 text-tinta-suave">
            {incluir === "mapa" ? "Este resumo ainda não tem mapa mental." : "Este resumo ainda não tem texto."}
          </p>
        )}
      </main>
    </>
  );
}
