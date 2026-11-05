"use client";

import { useState } from "react";
import { botaoSecundario, botaoTexto, campo } from "@/components/ui/estilos";
import { ajudaColar, itensColados } from "@/lib/atividades/colar";
import type { Exercicio } from "@/lib/atividades/modelo";

/** Cria vários itens de uma vez a partir de linhas coladas. */
export function ColarItens({ exercicio, onChange }: { exercicio: Exercicio; onChange: (e: Exercicio) => void }) {
  const ajuda = ajudaColar[exercicio.tipo];
  const [aberto, setAberto] = useState(false);
  const [texto, setTexto] = useState("");
  const [aviso, setAviso] = useState("");
  if (!ajuda) return null;

  const colunas = exercicio.tipo === "classificar" ? exercicio.colunas : [];
  const previa = texto.trim() ? itensColados(exercicio.tipo, texto, colunas) : null;

  function adicionar() {
    if (!previa || previa.itens.length === 0) return;
    const novo = { ...exercicio, itens: [...exercicio.itens, ...previa.itens] } as Exercicio;
    if (novo.tipo === "classificar") novo.colunas = [...novo.colunas, ...previa.colunasNovas];
    onChange(novo);
    const n = previa.itens.length;
    setAviso(`${n} ${n === 1 ? "item adicionado" : "itens adicionados"}. Agora é só escrever as explicações dos erros.`);
    setTexto("");
    setAberto(false);
  }

  if (!aberto) {
    return (
      <span className="ml-4 inline-flex flex-wrap items-baseline gap-x-3">
        <button type="button" onClick={() => setAberto(true)} className={botaoTexto}>
          Colar vários
        </button>
        {aviso && (
          <span role="status" className="text-sm text-tinta-suave">
            {aviso}
          </span>
        )}
      </span>
    );
  }

  return (
    <div className="mt-4 rounded-xl bg-suave p-4">
      <p className="text-sm font-bold">Colar vários de uma vez</p>
      <p className="mt-1 text-sm text-tinta-suave">{ajuda.explicacao}</p>
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={6}
        placeholder={ajuda.exemplo}
        aria-label="Linhas para virar itens"
        className={`${campo} mt-3 font-mono text-sm`}
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" onClick={adicionar} disabled={!previa?.itens.length} className={botaoSecundario}>
          {previa?.itens.length ? `Adicionar ${previa.itens.length} ${previa.itens.length === 1 ? "item" : "itens"}` : "Adicionar"}
        </button>
        <button type="button" onClick={() => setAberto(false)} className={botaoTexto}>
          Cancelar
        </button>
        {previa && previa.ignoradas > 0 && (
          <span className="text-sm text-aviso">
            {previa.ignoradas} {previa.ignoradas === 1 ? "linha fora do formato será ignorada" : "linhas fora do formato serão ignoradas"}
          </span>
        )}
      </div>
    </div>
  );
}
