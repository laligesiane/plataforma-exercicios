// Eventos que a Repasa manda para o Google Analytics 4.
// sign_up e login são nomes recomendados pelo GA4 (ganham relatórios prontos); os outros são nossos.

export type NomeEvento = "sign_up" | "login" | "atividade_enviada" | "resumo_criado" | "jogo_concluido";

export type ParametrosEvento = Record<string, string | number | boolean>;

export type EventoPendente = { n: NomeEvento; p?: ParametrosEvento };

/**
 * Fila curta de eventos num cookie: o servidor (server actions, rotas) e o navegador escrevem nela,
 * e o componente Analytics esvazia a fila na página seguinte. Assim um evento sobrevive ao redirect.
 */
export const COOKIE_FILA = "repasa-eventos";

/** Escolha do aviso de cookies, guardada no navegador. */
export const CHAVE_ESCOLHA = "repasa-cookies";

export type EscolhaCookies = "aceito" | "recusado";

/** Disparado no window para o Analytics olhar a fila na hora (eventos do próprio navegador). */
export const EVENTO_FILA = "repasa:eventos";

/** Disparado no window para reabrir o aviso de cookies (ex.: botão no perfil). */
export const EVENTO_ESCOLHA = "repasa:cookies";

/** Disparado no window depois que a escolha é gravada. */
export const EVENTO_ESCOLHIDA = "repasa:cookies-escolhida";

const MAX_FILA = 10;

export function lerFila(valor: string | undefined | null): EventoPendente[] {
  if (!valor) return [];
  try {
    const lista = JSON.parse(decodeURIComponent(valor));
    return Array.isArray(lista) ? lista.filter((e) => e && typeof e.n === "string").slice(-MAX_FILA) : [];
  } catch {
    return [];
  }
}

export function gravarFila(fila: EventoPendente[]): string {
  return encodeURIComponent(JSON.stringify(fila.slice(-MAX_FILA)));
}
