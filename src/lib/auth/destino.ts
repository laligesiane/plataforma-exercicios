/** Só caminhos internos, para um link não levar a outro site. */
export function caminhoInterno(caminho: string | null | undefined): string | null {
  return caminho && /^\/(?![/\\])/.test(caminho) ? caminho : null;
}

/** Páginas que quem ainda falta digitar o código do app autenticador pode abrir. */
export function liberadaSemSegundaEtapa(caminho: string): boolean {
  return caminho === "/entrar/verificar" || caminho.startsWith("/auth/") || caminho.startsWith("/agenda/");
}
