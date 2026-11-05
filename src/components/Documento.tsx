import type { ReactNode } from "react";
import { idSecao, type Documento as Doc, type No } from "@/lib/documento";

/**
 * Mostra o documento do resumo. Só monta elementos conhecidos, nada de HTML vindo do banco.
 * Cada parágrafo ou título com texto leva data-trecho (na ordem de trechosDoDocumento), para a
 * leitura em voz alta marcar o que está sendo lido.
 */
export function Documento({ doc }: { doc: Doc }) {
  let secoes = 0;
  let trechos = 0;
  const textoDe = (no: No): string =>
    no.type === "text" ? no.text : (no.content ?? []).map(textoDe).join("");
  const trecho = (no: No) => (textoDe(no).trim() ? { "data-trecho": trechos++ } : {});

  const filhos = (no: { content?: No[] }) => (no.content ?? []).map((f, i) => render(f, i));

  function render(no: No, chave: number): ReactNode {
    if (no.type === "text") {
      let el: ReactNode = no.text;
      for (const m of no.marks ?? []) {
        if (m.type === "bold") el = <strong>{el}</strong>;
        else if (m.type === "italic") el = <em>{el}</em>;
        else if (m.type === "highlight") el = <mark>{el}</mark>;
      }
      return <span key={chave}>{el}</span>;
    }
    switch (no.type) {
      case "paragraph":
        return (
          <p key={chave} {...trecho(no)}>
            {filhos(no)}
          </p>
        );
      case "heading": {
        const texto = (no.content ?? []).map((f) => (f.type === "text" ? f.text : "")).join("").trim();
        const id = texto ? idSecao(texto, secoes++) : undefined;
        const marca = trecho(no);
        return no.attrs?.level === 3 ? (
          <h3 key={chave} id={id} {...marca}>
            {filhos(no)}
          </h3>
        ) : (
          <h2 key={chave} id={id} {...marca}>
            {filhos(no)}
          </h2>
        );
      }
      case "bulletList":
        return <ul key={chave}>{filhos(no)}</ul>;
      case "orderedList":
        return <ol key={chave}>{filhos(no)}</ol>;
      case "listItem":
        return <li key={chave}>{filhos(no)}</li>;
      case "blockquote":
        return (
          <blockquote key={chave} role="note">
            {filhos(no)}
          </blockquote>
        );
      case "hardBreak":
        return <br key={chave} />;
      case "horizontalRule":
        return <hr key={chave} />;
    }
  }

  return <div className="documento">{doc.content.map((n, i) => render(n, i))}</div>;
}
