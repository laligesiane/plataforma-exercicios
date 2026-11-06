import "server-only";
import { fmt } from "@/i18n/config";
import { obterDicionario } from "@/i18n/servidor";
import { acharPalavrao } from ".";

/**
 * Para as ações que salvam texto: confere os textos e devolve o aviso (no idioma da pessoa)
 * se algum tiver palavrão, ou null se estiver tudo certo. A Repasa bloqueia e pede para trocar
 * a palavra (decisão de 06/11/2026), em vez de salvar com asteriscos.
 */
export async function avisoPalavrao(...textos: (string | null | undefined)[]): Promise<string | null> {
  for (const texto of textos) {
    const palavra = acharPalavrao(texto);
    if (palavra) return fmt((await obterDicionario()).palavrao.aviso, { palavra });
  }
  return null;
}
