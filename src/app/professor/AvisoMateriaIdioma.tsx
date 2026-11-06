import { botaoTexto } from "@/components/ui/estilos";
import { idiomas, type Idioma } from "@/lib/idiomas";

/** Avisa quem escolheu "Uma matéria" mas escreveu o nome de um idioma, e oferece trocar para "Um idioma". */
export function AvisoMateriaIdioma({ idioma, onUsarIdioma }: { idioma: Idioma | null; onUsarIdioma: (codigo: Idioma) => void }) {
  if (!idioma) return null;
  return (
    <div role="status" className="mt-2 rounded-xl bg-primaria-suave px-3.5 py-3 text-sm">
      <p>
        <strong className="font-bold">{idiomas[idioma]} é um idioma.</strong>{" "}
        <span className="text-tinta-suave">
          Escolhendo &quot;Um idioma&quot;, os alunos ouvem as frases com a pronúncia de {idiomas[idioma].toLowerCase()} e a atividade
          ganha os níveis A1 a C2.
        </span>
      </p>
      <button type="button" onClick={() => onUsarIdioma(idioma)} className={`${botaoTexto} mt-1`}>
        Usar &quot;Um idioma&quot;
      </button>
    </div>
  );
}
