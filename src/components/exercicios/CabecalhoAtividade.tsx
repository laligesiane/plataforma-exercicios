import { categorias, type Atividade } from "@/lib/atividades/modelo";
import { nomeIdioma } from "@/lib/idiomas";

export function CabecalhoAtividade({ atividade }: { atividade: Pick<Atividade, "titulo" | "nivel" | "categoria" | "idioma_ensinado" | "explicacao"> }) {
  return (
    <>
      <div className="flex flex-wrap gap-2 text-xs font-bold">
        <span className="rounded-full bg-primaria-suave px-3 py-1 text-primaria">{atividade.nivel}</span>
        <span className="rounded-full bg-suave px-3 py-1 text-tinta-suave">{categorias[atividade.categoria]}</span>
        <span className="rounded-full bg-suave px-3 py-1 text-tinta-suave">{nomeIdioma(atividade.idioma_ensinado)}</span>
      </div>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight">{atividade.titulo || "Atividade sem título"}</h1>
      {atividade.explicacao && (
        <div className="mt-4 rounded-2xl bg-suave p-5 leading-relaxed whitespace-pre-line">{atividade.explicacao}</div>
      )}
    </>
  );
}
