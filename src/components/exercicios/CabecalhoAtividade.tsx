import { etiquetasDaAtividade, type Atividade } from "@/lib/atividades/modelo";

type Dados = Pick<Atividade, "titulo" | "nivel" | "categoria" | "materia" | "idioma_ensinado" | "explicacao">;

export function CabecalhoAtividade({ atividade }: { atividade: Dados }) {
  const [primeira, ...resto] = etiquetasDaAtividade(atividade);
  return (
    <>
      <div className="flex flex-wrap gap-2 text-xs font-bold">
        <span className="rounded-full bg-primaria-suave px-3 py-1 text-primaria">{primeira}</span>
        {resto.map((etiqueta) => (
          <span key={etiqueta} className="rounded-full bg-suave px-3 py-1 text-tinta-suave">
            {etiqueta}
          </span>
        ))}
      </div>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight">{atividade.titulo || "Atividade sem título"}</h1>
      {atividade.explicacao && (
        <div className="mt-4 rounded-2xl bg-suave p-5 leading-relaxed whitespace-pre-line">{atividade.explicacao}</div>
      )}
    </>
  );
}
