export const idiomas = {
  pt: "Português",
  es: "Espanhol",
  en: "Inglês",
  fr: "Francês",
  it: "Italiano",
  de: "Alemão",
} as const;

export type Idioma = keyof typeof idiomas;

export function ehIdioma(valor: string): valor is Idioma {
  return valor in idiomas;
}

export function nomeIdioma(codigo: string) {
  return ehIdioma(codigo) ? idiomas[codigo] : codigo;
}

const semAcento = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

/** Nomes que o professor costuma digitar para cada idioma (sem acento, minúsculos). */
const apelidos: Record<string, Idioma> = {
  espanhol: "es",
  castelhano: "es",
  espanol: "es",
  ingles: "en",
  english: "en",
  frances: "fr",
  italiano: "it",
  alemao: "de",
};

/**
 * Quando o professor escolhe "Uma matéria" e escreve o nome de um idioma ("Inglês 9º ano"), devolve o código dele,
 * para sugerir "Um idioma" (que traz o áudio no idioma e os níveis A1 a C2). Português fica de fora: para
 * brasileiros, é matéria da escola.
 */
export function idiomaNaMateria(materia: string): Idioma | null {
  const primeira = semAcento(materia).split(/[\s,.;:/()-]+/)[0] ?? "";
  return apelidos[primeira] ?? null;
}
