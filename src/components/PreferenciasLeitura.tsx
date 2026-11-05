"use client";

import { useEffect, useState } from "react";

type Preferencias = { tamanho: "normal" | "grande" | "maior"; dislexia: boolean };
const CHAVE = "repasa-leitura";
const padrao: Preferencias = { tamanho: "normal", dislexia: false };

/** Script curto que roda antes de pintar a página, para não piscar o tamanho errado. */
export const scriptLeitura = `try{var p=JSON.parse(localStorage.getItem("${CHAVE}")||"{}");var h=document.documentElement;if(p.tamanho&&p.tamanho!=="normal")h.dataset.tamanho=p.tamanho;if(p.dislexia)h.dataset.dislexia="1"}catch(e){}`;

function aplicar(p: Preferencias) {
  const html = document.documentElement;
  if (p.tamanho === "normal") delete html.dataset.tamanho;
  else html.dataset.tamanho = p.tamanho;
  if (p.dislexia) html.dataset.dislexia = "1";
  else delete html.dataset.dislexia;
}

/** Opções de leitura: tamanho do texto e leitura com mais espaço (ajuda quem tem dislexia). Fica salvo só neste aparelho. */
export function PainelLeitura() {
  const [prefs, setPrefs] = useState<Preferencias>(padrao);

  useEffect(() => {
    try {
      setPrefs({ ...padrao, ...JSON.parse(localStorage.getItem(CHAVE) || "{}") });
    } catch {
      /* sem armazenamento: fica o padrão */
    }
  }, []);

  function mudar(novo: Partial<Preferencias>) {
    const p = { ...prefs, ...novo };
    setPrefs(p);
    aplicar(p);
    try {
      localStorage.setItem(CHAVE, JSON.stringify(p));
    } catch {
      /* ignora */
    }
  }

  const opcao = (ativo: boolean) =>
    `rounded-lg px-2.5 py-1 font-bold ${ativo ? "bg-primaria-suave text-primaria" : "text-tinta-suave hover:bg-suave hover:text-tinta"}`;

  return (
    <div className="text-sm">
      <p className="font-bold text-tinta">Tamanho do texto</p>
      <div className="mt-2 flex gap-1" role="group" aria-label="Tamanho do texto">
        {(
          [
            ["normal", "Normal"],
            ["grande", "Grande"],
            ["maior", "Maior"],
          ] as const
        ).map(([valor, rotulo]) => (
          <button key={valor} type="button" aria-pressed={prefs.tamanho === valor} onClick={() => mudar({ tamanho: valor })} className={opcao(prefs.tamanho === valor)}>
            {rotulo}
          </button>
        ))}
      </div>
      <label className="mt-4 flex items-start gap-2.5 text-tinta">
        <input type="checkbox" checked={prefs.dislexia} onChange={(e) => mudar({ dislexia: e.target.checked })} className="mt-0.5 size-4.5 accent-primaria" />
        <span>
          <strong className="font-bold">Leitura com mais espaço</strong>
          <span className="block text-xs text-tinta-suave">Letras mais legíveis e mais espaço entre letras e linhas. Ajuda quem tem dislexia.</span>
        </span>
      </label>
      <p className="mt-3 text-xs text-tinta-suave">Fica salvo neste aparelho.</p>
    </div>
  );
}

/** Botão "Aa" do cabeçalho, que abre as opções de leitura. */
export function PreferenciasLeitura() {
  return (
    <details className="relative">
      <summary
        className="flex size-8 cursor-pointer list-none items-center justify-center rounded-full font-extrabold text-tinta-suave hover:bg-suave hover:text-tinta [&::-webkit-details-marker]:hidden"
        title="Leitura: tamanho do texto e espaçamento"
        aria-label="Preferências de leitura"
      >
        Aa
      </summary>
      <div className="absolute right-0 z-30 mt-2 w-64 rounded-2xl border border-linha bg-fundo p-4 shadow-lg">
        <PainelLeitura />
      </div>
    </details>
  );
}
