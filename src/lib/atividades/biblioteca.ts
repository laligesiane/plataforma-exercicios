import { idiomas, ehIdioma, type Idioma } from "../idiomas";
import { ehEtapa, etapas, niveis, normalizarTemas, type Etapa, type Nivel } from "./modelo";

/** Filtros da biblioteca, já validados a partir da URL. */
export type FiltrosBiblioteca = {
  busca: string;
  /** "idioma:es" para atividades de idioma; o nome da matéria para as outras. */
  materia: { tipo: "idioma"; codigo: Idioma; valor: string } | { tipo: "materia"; nome: string; valor: string } | null;
  /** Etapa de ensino (qualquer matéria) ou nível A1 a C2 (só idiomas). */
  nivel: { tipo: "etapa"; etapa: Etapa; valor: string } | { tipo: "qecr"; nivel: Nivel; valor: string } | null;
  tema: string;
};

export type ParametrosBiblioteca = { q?: string; materia?: string; nivel?: string; tema?: string; idioma?: string };

/** Tira o que a sintaxe de filtros do PostgREST trataria como comando (vírgula, parênteses, curingas). */
export function limparTermo(texto: string) {
  return texto.replace(/[%_,()*"\\{}]/g, " ").replace(/\s+/g, " ").trim();
}

export function lerFiltros(p: ParametrosBiblioteca): FiltrosBiblioteca {
  const busca = limparTermo((p.q ?? "").slice(0, 80));

  // Links antigos usavam ?idioma=es.
  const bruta = (p.materia ?? "").trim() || (p.idioma ? `idioma:${p.idioma}` : "");
  let materia: FiltrosBiblioteca["materia"] = null;
  if (bruta.startsWith("idioma:")) {
    const codigo = bruta.slice("idioma:".length);
    if (ehIdioma(codigo)) materia = { tipo: "idioma", codigo, valor: `idioma:${codigo}` };
  } else {
    const nome = limparTermo(bruta.slice(0, 60));
    if (nome) materia = { tipo: "materia", nome, valor: nome };
  }

  const n = (p.nivel ?? "").trim();
  let nivel: FiltrosBiblioteca["nivel"] = null;
  if (ehEtapa(n)) nivel = { tipo: "etapa", etapa: n, valor: n };
  else if ((niveis as readonly string[]).includes(n)) nivel = { tipo: "qecr", nivel: n as Nivel, valor: n };

  const tema = limparTermo(normalizarTemas(p.tema ?? "")[0] ?? "");
  return { busca, materia, nivel, tema };
}

/** Monta o link da biblioteca com os filtros dados (os vazios ficam de fora). */
export function linkBiblioteca(f: { busca?: string; materia?: string; nivel?: string; tema?: string }) {
  const params = new URLSearchParams();
  if (f.busca) params.set("q", f.busca);
  if (f.materia) params.set("materia", f.materia);
  if (f.nivel) params.set("nivel", f.nivel);
  if (f.tema) params.set("tema", f.tema);
  const texto = params.toString();
  return texto ? `/biblioteca?${texto}` : "/biblioteca";
}

/** Opções do filtro "Matéria": as matérias e os idiomas que existem nas atividades públicas. */
export function opcoesDeMateria(linhas: { materia?: string | null; idioma_ensinado?: string | null }[]) {
  const materias = new Map<string, string>();
  const codigos = new Set<Idioma>();
  for (const l of linhas) {
    const nome = l.materia?.trim();
    if (nome) {
      const chave = nome.toLocaleLowerCase("pt-BR");
      if (!materias.has(chave)) materias.set(chave, nome);
    } else if (l.idioma_ensinado && ehIdioma(l.idioma_ensinado)) {
      codigos.add(l.idioma_ensinado);
    }
  }
  const ordem = (a: string, b: string) => a.localeCompare(b, "pt-BR");
  return {
    materias: [...materias.values()].sort(ordem),
    idiomas: [...codigos].map((codigo) => ({ valor: `idioma:${codigo}`, nome: idiomas[codigo] })).sort((a, b) => ordem(a.nome, b.nome)),
  };
}

export const opcoesDeEtapa = Object.entries(etapas).map(([valor, nome]) => ({ valor, nome }));
