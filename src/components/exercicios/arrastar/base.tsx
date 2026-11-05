"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useId, type ReactNode } from "react";

/**
 * Área de arrastar e soltar. Também funciona por toque: o aluno toca na peça e depois no destino,
 * o que é mais fácil no celular e para quem usa teclado.
 */
export function AreaArrastar({ children, onSoltar }: { children: ReactNode; onSoltar: (peca: string, destino: string) => void }) {
  // Id estável evita diferença entre o HTML do servidor e o do navegador.
  const id = useId();
  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } }),
    useSensor(KeyboardSensor),
  );

  function aoSoltar(e: DragEndEvent) {
    if (e.over) onSoltar(String(e.active.id), String(e.over.id));
  }

  return (
    <DndContext id={id} sensors={sensores} onDragEnd={aoSoltar} accessibility={{ screenReaderInstructions: { draggable: "Aperte espaço para pegar, setas para mover e espaço para soltar." } }}>
      {children}
    </DndContext>
  );
}

const estiloPeca = {
  normal: "border-linha bg-fundo hover:border-primaria",
  selecionada: "border-primaria bg-primaria-suave text-primaria",
  certa: "border-certo bg-certo-fundo text-certo",
  errada: "border-erro bg-erro-fundo text-erro",
} as const;

export type EstadoPeca = keyof typeof estiloPeca;

export function Peca({
  id,
  estado = "normal",
  desativada,
  onToque,
  cartao,
  children,
}: {
  id: string;
  /** Peça com imagem: cantos menos arredondados, para caber a figura. */
  cartao?: boolean;
  estado?: EstadoPeca;
  desativada?: boolean;
  onToque?: () => void;
  children: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id, disabled: desativada });
  const estilo = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={estilo}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        e.stopPropagation();
        onToque?.();
      }}
      disabled={desativada}
      aria-pressed={estado === "selecionada"}
      className={`touch-none border-2 font-bold ${cartao ? "rounded-xl p-1.5 pb-1" : "min-h-11 rounded-full px-4 py-1.5 sm:min-h-0"} transition-colors select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria disabled:cursor-default ${estiloPeca[estado]} ${isDragging ? "relative z-20 shadow-lg" : ""}`}
    >
      {children}
    </button>
  );
}

export function Alvo({
  id,
  className = "",
  classeAtiva = "border-primaria bg-primaria-suave",
  onToque,
  rotulo,
  inline,
  children,
}: {
  id: string;
  /** Dentro de uma frase (<p>), o alvo precisa ser um <span>. */
  inline?: boolean;
  className?: string;
  classeAtiva?: string;
  onToque?: () => void;
  rotulo: string;
  children: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const Tag = inline ? "span" : "div";
  return (
    <Tag
      ref={setNodeRef}
      role="button"
      tabIndex={onToque ? 0 : -1}
      aria-label={rotulo}
      onClick={onToque}
      onKeyDown={(e) => {
        if (onToque && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onToque();
        }
      }}
      className={`${className} ${isOver ? classeAtiva : ""}`}
    >
      {children}
    </Tag>
  );
}

/** Texto do cartão, com a imagem em cima quando houver. A imagem é decorativa: o texto já diz o que é. */
export function ConteudoCartao({ texto, imagem, pequena }: { texto: string; imagem?: string; pequena?: boolean }) {
  if (!imagem) return <>{texto}</>;
  return (
    <span className="flex flex-col items-center gap-1">
      {/* eslint-disable-next-line @next/next/no-img-element -- imagem enviada pelo professor, tamanho livre */}
      <img
        src={imagem}
        alt=""
        draggable={false}
        loading="lazy"
        className={`${pequena ? "size-12" : "size-20 sm:size-24"} rounded-lg bg-suave object-cover`}
      />
      <span className="px-1">{texto}</span>
    </span>
  );
}
