/**
 * Erro de "pedaço do site que não carregou": acontece quando a página ficou aberta durante uma
 * atualização da Repasa e o navegador pede um arquivo da versão antiga, que não existe mais.
 * Recarregar a página resolve.
 */
export function ehErroDeVersao(erro: { name?: string; message?: string } | null | undefined) {
  if (!erro) return false;
  const texto = `${erro.name ?? ""} ${erro.message ?? ""}`;
  return /ChunkLoadError|Loading (CSS )?chunk|Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(
    texto,
  );
}

export const CHAVE_RECARREGOU = "repasa:recarregou-por-versao";

/** Recarrega uma vez só por minuto, para não entrar em laço se o erro continuar depois de recarregar. */
export function podeRecarregar(ultima: string | null, agora: number) {
  const t = Number(ultima);
  return !Number.isFinite(t) || agora - t > 60_000;
}
