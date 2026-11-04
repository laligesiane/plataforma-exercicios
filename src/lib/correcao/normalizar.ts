/** Ignora maiúsculas e espaços sobrando. Mantém acentos e hífens. */
export function normalizarBasico(texto: string): string {
  return texto.normalize("NFC").trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

/** Além do básico, ignora acentos, hífens e espaços: "Arco Iris" e "arco-íris" ficam iguais. */
export function normalizarGrafia(texto: string): string {
  return normalizarBasico(texto)
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[-‐‑–\s]/g, "");
}
