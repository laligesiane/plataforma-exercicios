"use client";

import { useId, useState, useTransition } from "react";
import type { Correcao } from "@/components/exercicios/Producao";
import { botaoPrimario, campo } from "@/components/ui/estilos";
import { corrigirProducao } from "../../actions";

export function CorrigirProducao({
  atividadeId,
  producaoId,
  inicial,
}: {
  atividadeId: string;
  producaoId: number;
  inicial: Correcao | null;
}) {
  const id = useId();
  const [avaliacao, setAvaliacao] = useState<Correcao["avaliacao"] | null>(inicial?.avaliacao ?? null);
  const [comentario, setComentario] = useState(inicial?.comentario ?? "");
  const [estado, setEstado] = useState<"novo" | "salvo" | "erro">(inicial && !inicial.anterior ? "salvo" : "novo");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, iniciar] = useTransition();

  function salvar() {
    if (!avaliacao) return;
    iniciar(async () => {
      const r = await corrigirProducao({ atividadeId, producaoId, avaliacao, comentario }).catch(() => ({
        ok: false as const,
        erro: "Sem conexão. Tente de novo.",
      }));
      if (r.ok) {
        setEstado("salvo");
        setErro(null);
      } else {
        setEstado("erro");
        setErro(r.erro);
      }
    });
  }

  const mudar = <T,>(f: (v: T) => void) => (v: T) => {
    f(v);
    setEstado("novo");
  };

  return (
    <div className="mt-3 space-y-2">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Avaliação">
        {(
          [
            ["muito_bem", "Muito bem", "border-certo bg-certo-fundo text-certo"],
            ["refazer", "Pedir para refazer", "border-aviso bg-aviso-fundo text-aviso"],
          ] as const
        ).map(([valor, texto, ativo]) => (
          <button
            key={valor}
            type="button"
            aria-pressed={avaliacao === valor}
            onClick={() => mudar(setAvaliacao)(valor)}
            className={`rounded-full border-2 px-3.5 py-1 text-sm font-bold transition-colors ${avaliacao === valor ? ativo : "border-linha bg-fundo text-tinta-suave hover:border-tinta"}`}
          >
            {texto}
          </button>
        ))}
      </div>
      <label htmlFor={id} className="sr-only">
        Comentário para o aluno
      </label>
      <textarea
        id={id}
        value={comentario}
        onChange={(e) => mudar(setComentario)(e.target.value)}
        rows={3}
        maxLength={3000}
        placeholder="Comentário para o aluno (opcional). Ex.: Muito bom! Só faltou explicar a segunda parte."
        className={`${campo} bg-fundo`}
      />
      <div className="flex items-center gap-3">
        <button type="button" onClick={salvar} disabled={!avaliacao || salvando || estado === "salvo"} className={botaoPrimario}>
          {salvando ? "Salvando…" : estado === "salvo" ? "Correção salva" : "Salvar correção"}
        </button>
        {estado === "salvo" && <span className="text-sm font-semibold text-certo">✓ O aluno já vê.</span>}
        {erro && (
          <span role="alert" className="text-sm font-semibold text-erro">
            {erro}
          </span>
        )}
      </div>
    </div>
  );
}
