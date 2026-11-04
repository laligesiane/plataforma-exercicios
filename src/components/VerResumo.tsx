import { Documento } from "@/components/Documento";
import { MapaMental } from "@/components/MapaMental";
import { documentoTemConteudo, secoesDoDocumento } from "@/lib/documento";
import { validarMapa } from "@/lib/mapas";
import { documentoDoResumo, tituloResumo, type Resumo } from "@/lib/resumos";

/** Resumo como página: sumário das seções, o texto formatado e, se houver, o mapa mental. */
export function VerResumo({ resumo, subtitulo }: { resumo: Resumo; subtitulo?: string }) {
  const mapa = validarMapa(resumo.mapa);
  const temMapa = mapa && (mapa.centro || mapa.ramos.length > 0);
  const doc = documentoDoResumo(resumo);
  const temTexto = documentoTemConteudo(doc);
  const secoes = temTexto ? secoesDoDocumento(doc) : [];

  return (
    <article>
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{tituloResumo(resumo)}</h1>
      {subtitulo && <p className="mt-2 text-tinta-suave">{subtitulo}</p>}

      {secoes.length >= 2 && (
        <nav aria-label="Sumário" className="mt-6 rounded-2xl bg-suave p-5">
          <h2 className="text-sm font-bold tracking-wide text-tinta-suave uppercase">Neste resumo</h2>
          <ol className="mt-2 space-y-1">
            {secoes.map((s) => (
              <li key={s.id} className={s.nivel === 3 ? "pl-4 text-sm" : "font-bold"}>
                <a href={`#${s.id}`} className="hover:text-primaria hover:underline">
                  {s.texto}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      {temTexto && (
        <div className="mt-8">
          <Documento doc={doc} />
        </div>
      )}

      {temMapa && (
        <section className="mt-10">
          <h2 className="mb-3 text-sm font-bold tracking-wide text-tinta-suave uppercase">Mapa mental</h2>
          <MapaMental mapa={mapa} titulo={tituloResumo(resumo)} />
        </section>
      )}
    </article>
  );
}
