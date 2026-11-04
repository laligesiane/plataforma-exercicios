import { MapaMental } from "@/components/MapaMental";
import { validarMapa } from "@/lib/mapas";
import { tituloResumo, type Resumo } from "@/lib/resumos";

/** Resumo como o aluno vê: mapa mental e o texto para lembrar. */
export function VerResumo({ resumo, subtitulo }: { resumo: Resumo; subtitulo?: string }) {
  const mapa = validarMapa(resumo.mapa);
  const temMapa = mapa && (mapa.centro || mapa.ramos.length > 0);
  return (
    <article>
      <h1 className="text-3xl font-extrabold tracking-tight">{tituloResumo(resumo)}</h1>
      {subtitulo && <p className="mt-2 text-tinta-suave">{subtitulo}</p>}
      {temMapa && (
        <div className="mt-6">
          <MapaMental mapa={mapa} titulo={tituloResumo(resumo)} />
        </div>
      )}
      {resumo.texto.trim() && (
        <section className="mt-6 rounded-2xl bg-primaria-suave p-5">
          <h2 className="text-sm font-bold tracking-wide text-primaria uppercase">Para lembrar</h2>
          <p className="mt-2 whitespace-pre-line">{resumo.texto}</p>
        </section>
      )}
    </article>
  );
}
