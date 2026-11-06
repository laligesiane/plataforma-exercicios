/** Idiomas da interface da Repasa. Português é o padrão; para acrescentar um, crie o dicionário e ponha aqui. */
export const IDIOMAS = ["pt", "es", "en"] as const;
export type IdiomaSite = (typeof IDIOMAS)[number];
export const IDIOMA_PADRAO: IdiomaSite = "pt";

/** Cookie com o idioma escolhido (vale também sem login). */
export const COOKIE_IDIOMA = "repasa-idioma";

/** Nome de cada idioma escrito nele mesmo, para o seletor. */
export const NOME_NATIVO: Record<IdiomaSite, string> = { pt: "Português", es: "Español", en: "English" };

/** Valor do atributo lang do <html> e da localização do Open Graph. */
export const LANG_HTML: Record<IdiomaSite, string> = { pt: "pt-BR", es: "es", en: "en" };
export const LOCALE_OG: Record<IdiomaSite, string> = { pt: "pt_BR", es: "es_ES", en: "en_US" };

export function ehIdiomaSite(valor: unknown): valor is IdiomaSite {
  return typeof valor === "string" && (IDIOMAS as readonly string[]).includes(valor);
}

/**
 * Escolhe o idioma pelo cabeçalho Accept-Language do navegador ("es-AR,es;q=0.9,en;q=0.8").
 * Respeita a ordem de preferência; sem nada conhecido, fica o português.
 */
export function idiomaDoNavegador(cabecalho: string | null | undefined): IdiomaSite {
  if (!cabecalho) return IDIOMA_PADRAO;
  const opcoes = cabecalho
    .split(",")
    .map((parte, i) => {
      const [tag, ...params] = parte.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      return { base: tag.toLowerCase().split("-")[0], q: q ? Number(q.slice(2)) || 0 : 1, i };
    })
    .filter((o) => o.base && o.q > 0)
    .sort((a, b) => b.q - a.q || a.i - b.i);
  return opcoes.find((o) => ehIdiomaSite(o.base))?.base as IdiomaSite | undefined ?? IDIOMA_PADRAO;
}

/** Troca {chave} pelo valor: fmt("Olá, {nome}", { nome: "Ana" }). */
export function fmt(texto: string, valores: Record<string, string | number>) {
  return texto.replace(/\{(\w+)\}/g, (inteiro, chave: string) => (chave in valores ? String(valores[chave]) : inteiro));
}
