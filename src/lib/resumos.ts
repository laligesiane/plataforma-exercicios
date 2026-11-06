import { documentoDeTexto, textoDoDocumento, validarDocumento, type Documento } from "./documento";
import type { Mapa } from "./mapas";

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
  /** Rascunho (false) fica só com o professor; publicado aparece para os alunos da turma. */
  publicado?: boolean;
  /** Público: qualquer pessoa vê, sem login, e aparece na Biblioteca de resumos. */
  publico?: boolean;
  /** Etiquetas para filtrar na Biblioteca (minúsculas, até 8). */
  temas?: string[];
  atualizado_em: string;
};

export const camposResumo = "id, turma_id, aula_id, titulo, texto, conteudo, mapa, cor, publicado, publico, temas, atualizado_em";

/** Quem vê o resumo do professor, do mais fechado ao mais aberto. */
export const visibilidadesResumo = {
  rascunho: { nome: "Só eu", explicacao: "Rascunho. Os alunos ainda não veem." },
  turma: { nome: "Alunos da turma", explicacao: "Só quem está na turma vê, depois de entrar na Repasa." },
  publico: {
    nome: "Público",
    explicacao: "Qualquer pessoa com o link vê, sem login, e o resumo aparece na Biblioteca de resumos.",
  },
} as const;
export type VisibilidadeResumo = keyof typeof visibilidadesResumo;

export function visibilidadeDoResumo(r: Pick<Resumo, "publicado" | "publico">): VisibilidadeResumo {
  if (r.publicado === false) return "rascunho";
  return r.publico ? "publico" : "turma";
}

/** Converte a escolha do formulário nas duas colunas do banco. Valor desconhecido vira "turma". */
export function lerVisibilidadeResumo(valor: unknown): { publicado: boolean; publico: boolean } {
  if (valor === "rascunho") return { publicado: false, publico: false };
  if (valor === "publico") return { publicado: true, publico: true };
  return { publicado: true, publico: false };
}

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
