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
