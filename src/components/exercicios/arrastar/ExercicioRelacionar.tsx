"use client";

import { useMemo, useState } from "react";
import { corrigirRelacionar, type Resultado } from "@/lib/correcao";
import { normalizarBasico } from "@/lib/correcao/normalizar";
import type { ExercicioRelacionar as Tipo } from "@/lib/atividades/modelo";
import { embaralhar } from "@/lib/embaralhar";
import { Feedback } from "../Feedback";
import { Alvo, AreaArrastar, Peca } from "./base";

type Props = {
  exercicio: Tipo;
  anteriores: Record<string, string>;
  onResultado: (itemId: string, resultado: Resultado, valor: string) => void;
};

/** O aluno arrasta (ou toca) um item da esquerda até o par dele na direita. */
export function ExercicioRelacionar({ exercicio, anteriores, onResultado }: Props) {
  // Direita sem repetir textos iguais, em ordem embaralhada.
  const direitas = useMemo(() => {
    const unicas = new Map<string, string>();
    for (const item of exercicio.itens) {
      const chave = normalizarBasico(item.direita);
      if (!unicas.has(chave)) unicas.set(chave, item.direita);
    }
    return embaralhar([...unicas.values()], exercicio.id).map((texto, n) => ({ id: `d${n}`, texto }));
  }, [exercicio]);

  const [ligados, setLigados] = useState<Set<string>>(
    () =>
      new Set(
        exercicio.itens
          .filter((i) => anteriores[i.id] !== undefined && corrigirRelacionar(i, anteriores[i.id]).status === "certo")
          .map((i) => i.id),
      ),
  );
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [ultimo, setUltimo] = useState<{ itemId: string; resultado: Resultado } | null>(null);

  function ligar(itemId: string, direitaId: string) {
    const item = exercicio.itens.find((i) => i.id === itemId);
    const direita = direitas.find((d) => d.id === direitaId);
    if (!item || !direita || ligados.has(itemId)) return;
    const resultado = corrigirRelacionar(item, direita.texto);
    if (resultado.status === "certo") setLigados((l) => new Set(l).add(itemId));
    setUltimo({ itemId, resultado });
    setSelecionado(null);
    onResultado(itemId, resultado, direita.texto);
  }

  // Uma direita fica concluída quando todos os itens que levam a ela já foram ligados.
  const numeroDoPar = new Map(exercicio.itens.map((i, n) => [i.id, n + 1]));
  function paresDaDireita(texto: string) {
    return exercicio.itens.filter((i) => normalizarBasico(i.direita) === normalizarBasico(texto));
  }

  return (
    <AreaArrastar onSoltar={ligar}>
      <div className="grid grid-cols-2 gap-3 sm:gap-6">
        <div className="space-y-2">
          {exercicio.itens.map((item) => {
            const feito = ligados.has(item.id);
            const errado = ultimo?.itemId === item.id && ultimo.resultado.status === "errado";
            return (
              <div key={item.id} className="flex items-center gap-2">
                <span className="w-5 shrink-0 text-right text-sm font-extrabold text-tinta-suave tabular-nums">{numeroDoPar.get(item.id)}</span>
                <Peca
                  id={item.id}
                  desativada={feito}
                  estado={feito ? "certa" : selecionado === item.id ? "selecionada" : errado ? "errada" : "normal"}
                  onToque={() => setSelecionado((s) => (s === item.id ? null : item.id))}
                >
                  {item.esquerda}
                </Peca>
              </div>
            );
          })}
        </div>
        <div className="space-y-2">
          {direitas.map((d) => {
            const pares = paresDaDireita(d.texto);
            const feitos = pares.filter((p) => ligados.has(p.id));
            const concluida = feitos.length === pares.length;
            return (
              <Alvo
                key={d.id}
                id={d.id}
                rotulo={`Par: ${d.texto}`}
                onToque={selecionado && !concluida ? () => ligar(selecionado, d.id) : undefined}
                className={`flex min-h-10 items-center justify-between gap-2 rounded-xl border-2 px-3 py-1.5 font-bold transition-colors ${concluida ? "border-certo bg-certo-fundo text-certo" : selecionado ? "cursor-pointer border-dashed border-primaria" : "border-linha"}`}
              >
                <span>{d.texto}</span>
                {feitos.length > 0 && (
                  <span className="text-xs font-extrabold tabular-nums">{feitos.map((p) => numeroDoPar.get(p.id)).join(", ")}</span>
                )}
              </Alvo>
            );
          })}
        </div>
      </div>
      {ultimo && <Feedback resultado={ultimo.resultado} />}
    </AreaArrastar>
  );
}
