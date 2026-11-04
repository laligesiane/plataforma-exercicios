import { ehMidia, enderecoDoVideo, type Midia } from "@/lib/atividades/midia";

/** Imagem, áudio ou vídeo no topo do exercício. Mídia com link inválido não aparece. */
export function MidiaExercicio({ midia }: { midia?: Midia }) {
  if (!midia || !ehMidia(midia)) return null;
  const legenda = midia.legenda ? <figcaption className="mt-2 text-sm text-tinta-suave">{midia.legenda}</figcaption> : null;

  if (midia.tipo === "imagem") {
    return (
      <figure className="mb-4">
        {/* eslint-disable-next-line @next/next/no-img-element -- imagem enviada pelo professor, tamanho livre */}
        <img
          src={midia.url}
          alt={midia.legenda ?? ""}
          loading="lazy"
          className="max-h-[420px] w-full rounded-xl bg-suave object-contain"
        />
        {legenda}
      </figure>
    );
  }

  if (midia.tipo === "audio") {
    return (
      <figure className="mb-4 rounded-xl bg-suave p-3">
        <audio controls preload="metadata" src={midia.url} className="w-full">
          Seu navegador não toca este áudio.
        </audio>
        {legenda}
      </figure>
    );
  }

  const endereco = enderecoDoVideo(midia.url);
  if (!endereco) return null;
  return (
    <figure className="mb-4">
      <div className="aspect-video overflow-hidden rounded-xl bg-suave">
        <iframe
          src={endereco}
          title={midia.legenda || "Vídeo do exercício"}
          className="size-full"
          loading="lazy"
          allow="encrypted-media; picture-in-picture; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
      {legenda}
    </figure>
  );
}
