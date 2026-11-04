import { documentoDeTexto, textoDoDocumento, validarDocumento, type Documento } from "@/lib/documento";
import type { Mapa } from "@/lib/mapas";

export type Resumo = {
  id: string;
  turma_id: string;
  aula_id: string | null;
  titulo: string;
  texto: string;
  conteudo: Documento | null;
  mapa: Mapa;
  atualizado_em: string;
};

export const camposResumo = "id, turma_id, aula_id, titulo, texto, conteudo, mapa, atualizado_em";

export function tituloResumo(r: Pick<Resumo, "titulo" | "mapa">) {
  return r.titulo.trim() || r.mapa?.centro?.trim() || "Resumo sem título";
}

/** Lê o conteúdo enviado pelo editor. Devolve o documento e o texto corrido dele. */
export function lerConteudo(valor: FormDataEntryValue | null): { conteudo: Documento | null; texto: string } {
  let conteudo: Documento | null = null;
  try {
    conteudo = validarDocumento(JSON.parse(String(valor ?? "null")));
  } catch {
    conteudo = null;
  }
  const texto = conteudo ? textoDoDocumento(conteudo) : "";
  return { conteudo: texto || conteudo?.content.some((n) => n.type === "horizontalRule") ? conteudo : null, texto };
}

/** Documento para mostrar ou editar, aceitando resumos antigos só com texto. */
export function documentoDoResumo(r: Pick<Resumo, "conteudo" | "texto">): Documento {
  return validarDocumento(r.conteudo) ?? documentoDeTexto(r.texto ?? "");
}
