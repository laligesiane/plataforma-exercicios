"use client";

import { useRef, useState } from "react";
import { resumirAtividade, type ResumoAtividade } from "@/lib/atividades/resumo";
import { botaoPrimario } from "@/components/ui/estilos";
import { PainelResumo } from "./PainelResumo";
import { corrigir, type Resultado } from "@/lib/correcao";
import { ehAutomatico, type Exercicio } from "@/lib/atividades/modelo";
import { ExercicioKahoot } from "./ExercicioKahoot";
import { ItemProducao, type ProducaoSalva, type EnviarProducao } from "./Producao";
import { CartaoExercicio } from "./CartaoExercicio";
import { NaoEntendi, type DuvidaSalva, type EnviarDuvida } from "./NaoEntendi";
import { Lacuna } from "./Lacuna";
import { MultiplaEscolha } from "./MultiplaEscolha";
import { ExercicioArrastar } from "./arrastar/ExercicioArrastar";
import { ExercicioClassificar } from "./arrastar/ExercicioClassificar";
import { ExercicioRelacionar } from "./arrastar/ExercicioRelacionar";

export type RespostaDada = {
  exercicioId: string;
  itemId: string;
  valor: string;
  status: Resultado["status"];
};

type Props = {
  exercicios: Exercicio[];
  /** Última resposta de cada item (por id do item), para retomar de onde parou. */
  respostasAnteriores?: Record<string, string>;
  /** Se a primeira resposta de cada item já salva estava certa. */
  primeirasAnteriores?: Record<string, boolean>;
  onResposta?: (resposta: RespostaDada) => void;
  /** Chamado ao clicar em "Enviar respostas", para registrar o envio. */
  onEnviar?: (resumo: ResumoAtividade) => void;
  /** Produções já enviadas (por id do item), com a correção do professor quando houver. */
  producoes?: Record<string, ProducaoSalva>;
  /** Envia uma produção escrita ou oral. Sem ela, a produção não pode ser enviada (visitante, professor). */
  onProducao?: EnviarProducao;
  /** Dúvidas já mandadas, por id do exercício. */
  duvidas?: Record<string, DuvidaSalva[]>;
  /** Manda uma dúvida ao professor. Sem ela, o botão "Não entendi" não aparece (visitante, professor). */
  onDuvida?: EnviarDuvida;
};

export function AulaAtividade({
  exercicios,
  respostasAnteriores = {},
  primeirasAnteriores,
  onResposta,
  onEnviar,
  producoes = {},
  onProducao,
  duvidas = {},
  onDuvida,
}: Props) {
  const totalItens = exercicios.filter(ehAutomatico).reduce((soma, e) => soma + e.itens.length, 0);
  const temOutros = exercicios.some((e) => !ehAutomatico(e));
  const [certos, setCertos] = useState(() => contarAnteriores(exercicios, respostasAnteriores));
  // Sem histórico salvo, a resposta retomada conta como a primeira.
  const [primeira, setPrimeira] = useState<Record<string, boolean>>(() => primeirasAnteriores ?? { ...certos });
  const [resumo, setResumo] = useState<ResumoAtividade | null>(null);
  const painel = useRef<HTMLDivElement>(null);
  const acertos = Object.values(certos).filter(Boolean).length;

  function registrar(exercicioId: string, itemId: string) {
    return (resultado: Resultado, valor: string) => {
      const certo = resultado.status !== "errado";
      setCertos((atual) => ({ ...atual, [itemId]: certo }));
      setPrimeira((atual) => (itemId in atual ? atual : { ...atual, [itemId]: certo }));
      onResposta?.({ exercicioId, itemId, valor, status: resultado.status });
    };
  }

  function enviar() {
    const novo = resumirAtividade(exercicios, certos, primeira);
    if (novo.semResposta > 0) {
      const itens = novo.semResposta === 1 ? "1 item" : `${novo.semResposta} itens`;
      if (!confirm(`Você ainda não respondeu ${itens}. Enviar mesmo assim?`)) return;
    }
    setResumo(novo);
    onEnviar?.(novo);
    requestAnimationFrame(() => painel.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  if (totalItens === 0 && !temOutros) {
    return <p className="text-tinta-suave">Esta atividade ainda não tem exercícios.</p>;
  }

  return (
    <div className="space-y-5">
      {totalItens > 0 && (
        <div className="flex items-center gap-3 text-sm font-semibold text-tinta-suave">
          <span className="tabular-nums">
            {acertos} de {totalItens} certos
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-suave">
            <div
              className="h-full rounded-full bg-primaria transition-[width] duration-500 motion-reduce:transition-none"
              style={{ width: `${(acertos / totalItens) * 100}%` }}
            />
          </div>
        </div>
      )}

      {exercicios.map((exercicio, i) => (
        <CartaoExercicio
          key={exercicio.id}
          numero={i + 1}
          titulo={exercicio.titulo}
          instrucoes={exercicio.instrucoes}
          midia={exercicio.midia}
          rodape={
            onDuvida && exercicio.tipo !== "kahoot" ? (
              <NaoEntendi exercicioId={exercicio.id} iniciais={duvidas[exercicio.id]} onEnviar={onDuvida} />
            ) : undefined
          }
        >
          <ConteudoExercicio
            exercicio={exercicio}
            anteriores={respostasAnteriores}
            registrar={(itemId) => registrar(exercicio.id, itemId)}
            producoes={producoes}
            onProducao={onProducao}
          />
        </CartaoExercicio>
      ))}

      {totalItens > 0 && (
        <div ref={painel} className="scroll-mt-4">
          {resumo ? (
            <PainelResumo resumo={resumo} onFechar={() => setResumo(null)} />
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-suave p-5 text-center">
              <p className="text-sm text-tinta-suave">Terminou? Envie para ver o resumo dos seus acertos.</p>
              <button type="button" onClick={enviar} className={botaoPrimario}>
                Enviar respostas
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export type Registrar = (itemId: string) => (resultado: Resultado, valor: string) => void;

/** Itens de um exercício, no componente do tipo dele. */
export function ConteudoExercicio({
  exercicio,
  anteriores,
  registrar,
  producoes = {},
  onProducao,
}: {
  exercicio: Exercicio;
  anteriores: Record<string, string>;
  registrar: Registrar;
  producoes?: Record<string, ProducaoSalva>;
  onProducao?: EnviarProducao;
}) {
  const aoResultado = (itemId: string, resultado: Resultado, valor: string) => registrar(itemId)(resultado, valor);

  switch (exercicio.tipo) {
    case "lacuna":
      return exercicio.itens.map((item) => (
        <Lacuna key={item.id} item={item} valorInicial={anteriores[item.id]} onResultado={registrar(item.id)} />
      ));
    case "multipla_escolha":
      return exercicio.itens.map((item) => (
        <MultiplaEscolha key={item.id} item={item} valorInicial={anteriores[item.id]} onResultado={registrar(item.id)} />
      ));
    case "arrastar":
      return (
        <div>
          <ExercicioArrastar exercicio={exercicio} anteriores={anteriores} onResultado={aoResultado} />
        </div>
      );
    case "classificar":
      return (
        <div>
          <ExercicioClassificar exercicio={exercicio} anteriores={anteriores} onResultado={aoResultado} />
        </div>
      );
    case "relacionar":
      return (
        <div>
          <ExercicioRelacionar exercicio={exercicio} anteriores={anteriores} onResultado={aoResultado} />
        </div>
      );
    case "producao":
      return exercicio.itens.map((item) => (
        <ItemProducao
          key={item.id}
          item={item}
          salva={producoes[item.id]}
          onEnviar={onProducao ? (dados) => onProducao(exercicio.id, item.id, dados) : undefined}
        />
      ));
    case "kahoot":
      return <ExercicioKahoot link={exercicio.link} />;
  }
}

/** Acertos das respostas que vieram do banco, sem gravá-las de novo. */
function contarAnteriores(exercicios: Exercicio[], anteriores: Record<string, string>) {
  const certos: Record<string, boolean> = {};
  for (const exercicio of exercicios.filter(ehAutomatico)) {
    for (const item of exercicio.itens) {
      const valor = anteriores[item.id];
      if (valor !== undefined) certos[item.id] = corrigir(item, valor).status !== "errado";
    }
  }
  return certos;
}
