/** Código da turma: 6 letras e números, sem os que se confundem (0/O, 1/I/L). */
export const letrasCodigo = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/** Limpa o que o aluno digitou: tira espaços e traços, põe em maiúsculas. Devolve null se não for um código. */
export function normalizarCodigo(valor: string): string | null {
  const limpo = valor.toUpperCase().replace(/[\s-]/g, "");
  return limpo.length === 6 && [...limpo].every((c) => letrasCodigo.includes(c)) ? limpo : null;
}

/** "ABC DEF", mais fácil de ler em voz alta e de copiar do quadro. */
export function formatarCodigo(codigo: string) {
  return `${codigo.slice(0, 3)} ${codigo.slice(3)}`;
}
