/** Página pública do professor: repasa.com.br/p/apelido. */

export const RESERVADOS = new Set(["admin", "repasa", "suporte", "professor", "aluno", "api", "ajuda"]);

/** Transforma o que a pessoa digitou num apelido de endereço: "Ana Lúcia" → "ana-lucia". */
export function normalizarApelido(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
}

/** Mensagem de erro, ou null se o apelido pode ser usado. Mesma regra do banco. */
export function problemaDoApelido(apelido: string): string | null {
  if (apelido.length < 3) return "O endereço precisa ter pelo menos 3 letras ou números.";
  if (!/^[a-z0-9]([a-z0-9-]{1,38}[a-z0-9])$/.test(apelido)) return "Use só letras sem acento, números e hífen.";
  if (RESERVADOS.has(apelido)) return "Esse endereço é reservado. Escolha outro.";
  return null;
}

export type Contato = { texto: string; href?: string };

/** Vira link quando é e-mail ou endereço https; senão fica só o texto. */
export function lerContato(contato: string): Contato | null {
  const texto = contato.trim();
  if (!texto) return null;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto)) return { texto, href: `mailto:${texto}` };
  if (/^https:\/\/[^\s]+$/i.test(texto)) return { texto: texto.replace(/^https:\/\//i, ""), href: texto };
  return { texto };
}
