"use client";

import {
  CHAVE_ESCOLHA,
  COOKIE_FILA,
  EVENTO_ESCOLHA,
  EVENTO_ESCOLHIDA,
  EVENTO_FILA,
  gravarFila,
  lerFila,
  type EscolhaCookies,
  type EventoPendente,
  type NomeEvento,
  type ParametrosEvento,
} from "./eventos";

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

type JanelaGa = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void } & Record<string, unknown>;

export function lerEscolha(): EscolhaCookies | null {
  try {
    const v = localStorage.getItem(CHAVE_ESCOLHA);
    return v === "aceito" || v === "recusado" ? v : null;
  } catch {
    return null;
  }
}

export function gravarEscolha(escolha: EscolhaCookies) {
  try {
    localStorage.setItem(CHAVE_ESCOLHA, escolha);
  } catch {}
  window.dispatchEvent(new Event(EVENTO_ESCOLHIDA));
}

/** Reabre o aviso de cookies em qualquer página. */
export function abrirEscolhaCookies() {
  window.dispatchEvent(new Event(EVENTO_ESCOLHA));
}

/** Registra um evento a partir do navegador. Só sai daqui se a pessoa aceitou os cookies. */
export function registrarEvento(n: NomeEvento, p?: ParametrosEvento) {
  if (!GA_ID) return;
  const fila = lerFilaDoCookie();
  fila.push(p ? { n, p } : { n });
  escreverFila(fila);
  window.dispatchEvent(new Event(EVENTO_FILA));
}

function lerFilaDoCookie(): EventoPendente[] {
  const par = document.cookie.split("; ").find((c) => c.startsWith(`${COOKIE_FILA}=`));
  return lerFila(par?.slice(COOKIE_FILA.length + 1));
}

function escreverFila(fila: EventoPendente[]) {
  document.cookie = fila.length
    ? `${COOKIE_FILA}=${gravarFila(fila)}; path=/; max-age=120; samesite=lax`
    : `${COOKIE_FILA}=; path=/; max-age=0; samesite=lax`;
}

/** Liga o gtag (só depois do "Aceitar"). Sem anúncios: tudo de publicidade fica negado. */
export function iniciarGtag() {
  const w = window as unknown as JanelaGa;
  w[`ga-disable-${GA_ID}`] = false;
  if (w.gtag) {
    w.gtag("consent", "update", { analytics_storage: "granted" });
    return;
  }
  w.dataLayer = w.dataLayer || [];
  w.gtag = function gtag() {
    // O gtag.js espera o objeto "arguments", não um array.
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer!.push(arguments);
  };
  w.gtag("consent", "default", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  w.gtag("js", new Date());
  w.gtag("config", GA_ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
}

/** Desliga o envio e apaga os cookies do GA (quando a pessoa recusa depois de ter aceitado). */
export function desligarGtag() {
  const w = window as unknown as JanelaGa;
  w[`ga-disable-${GA_ID}`] = true;
  w.gtag?.("consent", "update", { analytics_storage: "denied" });
  const partes = location.hostname.split(".");
  const dominios = partes.map((_, i) => partes.slice(i).join(".")).filter((d) => d.includes("."));
  for (const c of document.cookie.split("; ")) {
    const nome = c.split("=")[0];
    if (nome !== "_ga" && !nome.startsWith("_ga_")) continue;
    document.cookie = `${nome}=; path=/; max-age=0`;
    for (const d of dominios) document.cookie = `${nome}=; path=/; max-age=0; domain=.${d}`;
  }
}

/**
 * Esvazia a fila. Com "aceito", manda os eventos; com "recusado", só descarta.
 * Sem escolha ainda, deixa a fila (o cookie vence em 2 minutos).
 */
export function despacharFila(escolha: EscolhaCookies | null) {
  if (!escolha) return;
  const fila = lerFilaDoCookie();
  if (!fila.length) return;
  escreverFila([]);
  if (escolha !== "aceito") return;
  const w = window as unknown as JanelaGa;
  for (const e of fila) w.gtag?.("event", e.n, e.p ?? {});
}
