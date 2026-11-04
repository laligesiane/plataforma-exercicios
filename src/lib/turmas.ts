import { nomeIdioma } from "./idiomas";

export type DadosTurma = { materia?: string | null; idioma_ensinado: string | null; idioma_instrucao: string | null };

/** "Matemática" para outras matérias; "Espanhol explicado em português" para idiomas. */
export function descreverTurma(t: DadosTurma) {
  const materia = t.materia?.trim();
  if (materia) return materia;
  if (t.idioma_ensinado && t.idioma_instrucao) {
    return `${nomeIdioma(t.idioma_ensinado)} explicado em ${nomeIdioma(t.idioma_instrucao).toLowerCase()}`;
  }
  return "";
}

export const sugestoesMateria = [
  "Matemática",
  "Português",
  "Redação",
  "História",
  "Geografia",
  "Biologia",
  "Química",
  "Física",
  "Direito",
  "Música",
  "Violão",
  "Programação",
];
