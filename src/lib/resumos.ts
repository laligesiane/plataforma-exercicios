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
  /** Cor dos destaques da página do resumo. */
  cor?: CorResumo;
  atualizado_em: string;
};

export const camposResumo = "id, turma_id, aula_id, titulo, texto, conteudo, mapa, cor, atualizado_em";

/** Cores de destaque que o resumo pode usar; menta é a cor padrão da Repasa. */
export const coresResumo = {
  menta: { nome: "Verde", amostra: "#0f9d6b" },
  azul: { nome: "Azul", amostra: "#2f6fd6" },
  rosa: { nome: "Rosa", amostra: "#c2417e" },
  roxo: { nome: "Roxo", amostra: "#7a4fd1" },
  laranja: { nome: "Laranja", amostra: "#e0701b" },
} as const;
export type CorResumo = keyof typeof coresResumo;

export function lerCorResumo(valor: unknown): CorResumo {
  return typeof valor === "string" && valor in coresResumo ? (valor as CorResumo) : "menta";
}

export function tituloResumo(r: Pick<Resumo, "titulo" | "mapa">) {
  const centro = typeof r.mapa?.centro === "string" ? r.mapa.centro.trim() : "";
  return (typeof r.titulo === "string" ? r.titulo.trim() : "") || centro || "Resumo sem título";
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
