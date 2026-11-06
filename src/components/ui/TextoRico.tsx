import { Fragment } from "react";

/**
 * Texto traduzido com marcações simples: **negrito**, *itálico* e ==marca-texto==.
 * Assim cada idioma põe o destaque onde fica natural na frase.
 */
export function TextoRico({ texto, classeNegrito = "", classeMarca = "" }: { texto: string; classeNegrito?: string; classeMarca?: string }) {
  const partes = texto.split(/(\*\*[^*]+\*\*|\*[^*]+\*|==[^=]+==)/);
  return (
    <>
      {partes.map((p, i) => {
        if (p.startsWith("**") && p.endsWith("**") && p.length > 4) return <strong key={i} className={classeNegrito}>{p.slice(2, -2)}</strong>;
        if (p.startsWith("==") && p.endsWith("==") && p.length > 4) return <mark key={i} className={classeMarca}>{p.slice(2, -2)}</mark>;
        if (p.startsWith("*") && p.endsWith("*") && p.length > 2) return <em key={i}>{p.slice(1, -1)}</em>;
        return <Fragment key={i}>{p}</Fragment>;
      })}
    </>
  );
}
