"use client";

import { useDicionario } from "@/i18n/cliente";
import { useState, useTransition } from "react";
import { botaoTexto } from "@/components/ui/estilos";

/** Gera o mapa mental a partir do resumo salvo, direto da página de leitura. */
export function BotaoGerarMapa({
  acao,
  temMapa,
}: {
  acao: () => Promise<{ erro: string } | void>;
  temMapa: boolean;
}) {
  const [pendente, iniciar] = useTransition();
  const [aviso, setAviso] = useState("");
  const tx = useDicionario().resumo;

  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-3">
      <button
        type="button"
        disabled={pendente}
        className={`${botaoTexto} disabled:opacity-60`}
        onClick={() => {
          if (temMapa && !window.confirm(tx.trocarMapa)) return;
          iniciar(async () => {
            const r = await acao();
            setAviso(r?.erro ?? tx.mapaGerado);
          });
        }}
      >
        {pendente ? tx.gerando : `✦ ${temMapa ? tx.gerarDeNovo : tx.gerarMapa}`}
      </button>
      {aviso && (
        <span role="status" className="text-sm text-tinta-suave">
          {aviso}
        </span>
      )}
    </span>
  );
}
