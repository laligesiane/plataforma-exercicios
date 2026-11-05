import { Documento } from "@/components/Documento";
import { MapaMental } from "@/components/MapaMental";
import { MapaTelaCheia } from "@/components/MapaTelaCheia";
import { Sumario, SumarioCompacto } from "@/components/Sumario";
import { LerEmVozAlta } from "@/components/LerEmVozAlta";
import { documentoTemConteudo, secoesDoDocumento, textoDoDocumento } from "@/lib/documento";
import { validarMapa } from "@/lib/mapas";
import { documentoDoResumo, tituloResumo, type Resumo } from "@/lib/resumos";

/** Resumo como página: sumário fixo ao lado (no celular, numa faixa presa no topo), o texto formatado e, se houver, o mapa mental. */
export function VerResumo({ resumo, subtitulo }: { resumo: Resumo; subtitulo?: string }) {
  const mapa = validarMapa(resumo.mapa);
  const temMapa = mapa && (mapa.centro || mapa.ramos.length > 0);
  const doc = documentoDoResumo(resumo);
  const temTexto = documentoTemConteudo(doc);
  const secoes = temTexto ? secoesDoDocumento(doc) : [];
  const temSumario = secoes.length >= 2;

  return (
    <article data-cor={resumo.cor ?? "menta"}>
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{tituloResumo(resumo)}</h1>
      {subtitulo && <p className="mt-2 text-tinta-suave">{subtitulo}</p>}
      {temTexto && (
        <div className="mt-3">
          <LerEmVozAlta texto={`${tituloResumo(resumo)}. ${textoDoDocumento(doc)}`} />
        </div>
      )}


      {temTexto &&
        (temSumario ? (
          <div className="mt-6 lg:grid lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-10">
            <SumarioCompacto secoes={secoes} />
            <aside className="hidden lg:order-2 lg:block">
              <div className="lg:sticky lg:top-6">
                <Sumario secoes={secoes} />
              </div>
            </aside>
            <div className="min-w-0 lg:order-1">
              <Documento doc={doc} />
            </div>
          </div>
        ) : (
          <div className="mt-8">
            <Documento doc={doc} />
          </div>
        ))}

      {temMapa && (
        <section className="mt-10">
          <h2 className="mb-3 text-sm font-bold tracking-wide text-tinta-suave uppercase">Mapa mental</h2>
          <MapaTelaCheia titulo={tituloResumo(resumo)}>
            <MapaMental mapa={mapa} titulo={tituloResumo(resumo)} />
          </MapaTelaCheia>
        </section>
      )}
    </article>
  );
}
