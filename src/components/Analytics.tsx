"use client";

import Link from "next/link";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { botaoPrimario, botaoSecundario } from "@/components/ui/estilos";
import { EVENTO_ESCOLHA, EVENTO_FILA, type EscolhaCookies } from "@/lib/analytics/eventos";
import { GA_ID, despacharFila, desligarGtag, gravarEscolha, iniciarGtag, lerEscolha } from "@/lib/analytics/cliente";

/**
 * Google Analytics 4 com aviso de cookies (LGPD): o script do Google só carrega depois do "Aceitar".
 * Sem NEXT_PUBLIC_GA_ID, não faz nada.
 */
export function Analytics() {
  // undefined = ainda lendo o navegador; null = a pessoa ainda não escolheu.
  const [escolha, setEscolha] = useState<EscolhaCookies | null | undefined>(undefined);
  const [aviso, setAviso] = useState(false);
  const caminho = usePathname();

  useEffect(() => {
    const atual = lerEscolha();
    setEscolha(atual);
    setAviso(atual === null);
    const reabrir = () => setAviso(true);
    window.addEventListener(EVENTO_ESCOLHA, reabrir);
    return () => window.removeEventListener(EVENTO_ESCOLHA, reabrir);
  }, []);

  useEffect(() => {
    if (!GA_ID || escolha === undefined) return;
    if (escolha === "aceito") iniciarGtag();
    despacharFila(escolha);
    const olhar = () => despacharFila(escolha);
    window.addEventListener(EVENTO_FILA, olhar);
    return () => window.removeEventListener(EVENTO_FILA, olhar);
  }, [escolha, caminho]);

  if (!GA_ID) return null;

  function escolher(nova: EscolhaCookies) {
    gravarEscolha(nova);
    if (nova === "recusado" && escolha === "aceito") desligarGtag();
    setEscolha(nova);
    setAviso(false);
  }

  return (
    <>
      {escolha === "aceito" && (
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`} strategy="afterInteractive" />
      )}
      {aviso && (
        <div
          role="dialog"
          aria-label="Cookies"
          className="esconder-no-foco fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-[60] mx-auto max-w-md rounded-2xl border border-linha bg-fundo p-4 shadow-xl shadow-black/10 sm:bottom-4 print:hidden"
        >
          <div className="flex gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primaria-suave text-primaria">
              <svg viewBox="0 0 24 24" className="size-5" aria-hidden fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18" />
                <path d="M7 15l4-4 3 3 5-6" />
              </svg>
            </span>
            <p className="text-sm text-tinta-suave">
              A Repasa pode usar cookies do Google Analytics para entender quais partes mais ajudam a aprender. Não
              usamos para anúncios, nunca.{" "}
              <Link href="/privacidade" className="font-bold text-primaria hover:underline">
                Saiba mais
              </Link>
            </p>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button type="button" onClick={() => escolher("recusado")} className={botaoSecundario}>
              Recusar
            </button>
            <button type="button" onClick={() => escolher("aceito")} className={`${botaoPrimario} !px-4 !py-1.5 text-sm`}>
              Aceitar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
