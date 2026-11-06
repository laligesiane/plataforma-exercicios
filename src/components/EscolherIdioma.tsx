"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { trocarIdioma } from "@/i18n/acoes";
import { useDicionario, useIdioma } from "@/i18n/cliente";
import { IDIOMAS, LANG_HTML, NOME_NATIVO, type IdiomaSite } from "@/i18n/config";

const Globo = ({ className = "size-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={`${className} shrink-0`} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
  </svg>
);

const Visto = () => (
  <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

/** Troca o idioma: salva (cookie e conta) e recarrega os textos da página. */
function useTrocar() {
  const router = useRouter();
  const d = useDicionario();
  const [trocando, iniciar] = useTransition();
  const [erro, setErro] = useState("");

  function trocar(novo: IdiomaSite) {
    setErro("");
    iniciar(async () => {
      const r = await trocarIdioma(novo);
      if (r.erro) setErro(d.idioma.erro);
      document.documentElement.lang = LANG_HTML[novo];
      router.refresh();
    });
  }
  return { trocar, trocando, erro };
}

/** Botão com globo no cabeçalho, que abre a lista de idiomas. */
export function EscolherIdioma() {
  const atual = useIdioma();
  const d = useDicionario();
  const { trocar, trocando } = useTrocar();
  const [aberto, setAberto] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: PointerEvent) => !caixa.current?.contains(e.target as Node) && setAberto(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    document.addEventListener("pointerdown", fora);
    window.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", fora);
      window.removeEventListener("keydown", esc);
    };
  }, [aberto]);

  return (
    <div ref={caixa} className="relative">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        aria-haspopup="menu"
        aria-label={`${d.idioma.escolher}: ${NOME_NATIVO[atual]}`}
        title={d.idioma.escolher}
        className="flex h-8 items-center gap-1 rounded-full px-2 text-xs font-extrabold text-tinta-suave uppercase hover:bg-suave hover:text-tinta"
      >
        <Globo />
        {atual}
      </button>
      {aberto && (
        <div role="menu" className="absolute right-0 z-40 mt-2 w-44 rounded-2xl border border-linha bg-fundo p-2 shadow-xl">
          {IDIOMAS.map((i) => (
            <button
              key={i}
              type="button"
              role="menuitemradio"
              aria-checked={i === atual}
              lang={LANG_HTML[i]}
              disabled={trocando}
              onClick={() => {
                setAberto(false);
                if (i !== atual) trocar(i);
              }}
              className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm font-bold text-tinta hover:bg-suave aria-checked:text-primaria"
            >
              {NOME_NATIVO[i]}
              {i === atual && <Visto />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Lista de idiomas em botões, para o perfil e a folha "Mais" do celular. */
export function PainelIdioma() {
  const atual = useIdioma();
  const d = useDicionario();
  const { trocar, trocando, erro } = useTrocar();

  return (
    <div className="text-sm">
      <p className="flex items-center gap-2 font-bold text-tinta">
        <Globo className="size-4" />
        {d.idioma.rotulo}
      </p>
      <div className="mt-2 flex flex-wrap gap-1" role="radiogroup" aria-label={d.idioma.rotulo}>
        {IDIOMAS.map((i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={i === atual}
            lang={LANG_HTML[i]}
            disabled={trocando}
            onClick={() => i !== atual && trocar(i)}
            className={`rounded-lg px-2.5 py-1 font-bold ${i === atual ? "bg-primaria-suave text-primaria" : "text-tinta-suave hover:bg-suave hover:text-tinta"}`}
          >
            {NOME_NATIVO[i]}
          </button>
        ))}
      </div>
      {erro ? <p role="alert" className="mt-2 text-xs text-erro">{erro}</p> : <p className="mt-2 text-xs text-tinta-suave">{d.idioma.ajuda}</p>}
    </div>
  );
}

/** Com login: se a conta tem outro idioma salvo (escolhido em outro aparelho), passa a usá-lo aqui. */
export function SincronizarIdioma({ idioma }: { idioma: IdiomaSite }) {
  const router = useRouter();
  useEffect(() => {
    let vivo = true;
    trocarIdioma(idioma, false).then(() => {
      if (!vivo) return;
      document.documentElement.lang = LANG_HTML[idioma];
      router.refresh();
    });
    return () => {
      vivo = false;
    };
  }, [idioma, router]);
  return null;
}
