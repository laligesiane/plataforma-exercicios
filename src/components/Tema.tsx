"use client";

import { useEffect, useState, useTransition } from "react";
import { salvarTema } from "@/app/perfil/actions";
import { coresResumo, lerCorResumo, type CorResumo } from "@/lib/resumos";

/** A cor da Repasa usa a mesma paleta da "Cor dos destaques" do resumo. Menta é o padrão. */
export type CorTema = CorResumo;
const CHAVE = "repasa-tema";

/** Roda antes de pintar a página, para a cor escolhida não piscar em verde ao abrir. */
export const scriptTema = `try{var t=localStorage.getItem("${CHAVE}");if(t&&t!=="menta")document.documentElement.dataset.tema=t}catch(e){}`;

function aplicar(cor: CorTema) {
  const html = document.documentElement;
  if (cor === "menta") delete html.dataset.tema;
  else html.dataset.tema = cor;
  try {
    localStorage.setItem(CHAVE, cor);
  } catch {
    /* sem armazenamento: vale só nesta página */
  }
}

/** Mantém o aparelho com a cor salva na conta (ex.: escolhida no celular, aberta no computador). */
export function SincronizarTema({ tema }: { tema?: string | null }) {
  useEffect(() => {
    const cor = lerCorResumo(tema);
    if ((document.documentElement.dataset.tema ?? "menta") !== cor) aplicar(cor);
    else
      try {
        localStorage.setItem(CHAVE, cor);
      } catch {
        /* ignora */
      }
  }, [tema]);
  return null;
}

/** Bolinhas de cor do perfil: troca na hora e salva na conta. */
export function EscolherTema({ inicial }: { inicial?: string | null }) {
  const [cor, setCor] = useState<CorTema>(lerCorResumo(inicial));
  const [aviso, setAviso] = useState("");
  const [salvando, iniciar] = useTransition();

  function escolher(nova: CorTema) {
    const anterior = cor;
    setCor(nova);
    aplicar(nova);
    setAviso("");
    iniciar(async () => {
      const r = await salvarTema(nova);
      if (r.erro) {
        setCor(anterior);
        aplicar(anterior);
        setAviso(r.erro);
      } else setAviso("Cor salva na sua conta.");
    });
  }

  return (
    <div>
      <fieldset className="flex flex-wrap items-center gap-2.5">
        <legend className="sr-only">Cor da Repasa</legend>
        {(Object.entries(coresResumo) as [CorTema, (typeof coresResumo)[CorTema]][]).map(([c, info]) => (
          <button
            key={c}
            type="button"
            title={info.nome}
            aria-label={`Repasa em ${info.nome.toLowerCase()}`}
            aria-pressed={cor === c}
            disabled={salvando}
            onClick={() => cor !== c && escolher(c)}
            className={`size-9 rounded-full outline-offset-2 transition-transform hover:scale-110 disabled:cursor-wait ${cor === c ? "outline-2 outline-tinta" : ""}`}
            style={{ background: info.amostra }}
          />
        ))}
      </fieldset>
      <p className="mt-3 text-xs text-tinta-suave" role="status">
        {salvando ? "Salvando..." : aviso || "Muda os botões, links e destaques em toda a Repasa, em qualquer aparelho em que você entrar."}
      </p>
    </div>
  );
}
