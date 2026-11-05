"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { PlantaFoco } from "@/components/PlantaFoco";
import { faseDoProgresso, formatarTempo, progressoDa, restanteDa, ULTIMA_FASE } from "@/lib/foco";
import { useFoco } from "./FocoProvider";

const PAGINA_FOCO = "/aluno/foco";
const CHAVE_POSICAO = "repasa:foco-posicao";
const MARGEM = 8;

type Posicao = { x: number; y: number };

/** Mantém a caixa inteira dentro da tela. */
function prender(p: Posicao, caixa: HTMLElement | null): Posicao {
  const largura = caixa?.offsetWidth ?? 200;
  const altura = caixa?.offsetHeight ?? 70;
  return {
    x: Math.min(Math.max(MARGEM, p.x), Math.max(MARGEM, window.innerWidth - largura - MARGEM)),
    y: Math.min(Math.max(MARGEM, p.y), Math.max(MARGEM, window.innerHeight - altura - MARGEM)),
  };
}

/** Posição escolhida pelo aluno, arrastando pela alça; sem escolha, fica no canto superior direito. */
function usePosicao() {
  const ref = useRef<HTMLDivElement>(null);
  const [posicao, setPosicao] = useState<Posicao | null>(null);
  const arrasto = useRef<{ dx: number; dy: number } | null>(null);

  useEffect(() => {
    try {
      const salva = JSON.parse(localStorage.getItem(CHAVE_POSICAO) ?? "null") as Posicao | null;
      if (salva && typeof salva.x === "number" && typeof salva.y === "number") setPosicao(prender(salva, ref.current));
    } catch {}
    function aoRedimensionar() {
      setPosicao((p) => (p ? prender(p, ref.current) : p));
    }
    window.addEventListener("resize", aoRedimensionar);
    return () => window.removeEventListener("resize", aoRedimensionar);
  }, []);

  const alca = {
    onPointerDown(e: PointerEvent<HTMLElement>) {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      arrasto.current = { dx: e.clientX - r.left, dy: e.clientY - r.top };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    onPointerMove(e: PointerEvent<HTMLElement>) {
      if (!arrasto.current) return;
      setPosicao(prender({ x: e.clientX - arrasto.current.dx, y: e.clientY - arrasto.current.dy }, ref.current));
    },
    onPointerUp() {
      arrasto.current = null;
      setPosicao((p) => {
        try {
          if (p) localStorage.setItem(CHAVE_POSICAO, JSON.stringify(p));
        } catch {}
        return p;
      });
    },
  };

  const estilo = posicao ? { left: posicao.x, top: posicao.y } : { right: 12, top: 6 };
  return { ref, estilo, alca };
}

function Alca(props: ReturnType<typeof usePosicao>["alca"]) {
  return (
    <span
      {...props}
      onPointerCancel={props.onPointerUp}
      role="presentation"
      title="Arraste para mover"
      className="flex cursor-grab touch-none items-center self-stretch px-1 text-tinta-suave select-none active:cursor-grabbing"
    >
      <svg width="10" height="18" viewBox="0 0 10 18" aria-hidden>
        {[3, 9, 15].map((y) => (
          <g key={y} fill="currentColor">
            <circle cx="2.5" cy={y} r="1.6" />
            <circle cx="7.5" cy={y} r="1.6" />
          </g>
        ))}
      </svg>
    </span>
  );
}

/**
 * O Brotinho flutuante: acompanha o aluno pelas páginas da Repasa enquanto o foco está ligado
 * e comemora quando a árvore fica pronta. Fica no canto superior e dá para arrastar pela alça.
 * Some na própria página do modo foco.
 */
export function MiniBrotinho() {
  const { sessao, agora, concluida, pausar, retomar, dispensarConclusao } = useFoco();
  const caminho = usePathname();
  const { ref, estilo, alca } = usePosicao();
  if (caminho === PAGINA_FOCO) return null;

  const caixa =
    "fixed z-50 flex items-center gap-2 rounded-2xl border border-linha bg-fundo py-1 pr-2.5 pl-1 shadow-lg shadow-black/10";

  if (concluida !== null && !sessao) {
    return (
      <div ref={ref} style={estilo} role="status" className={caixa}>
        <Alca {...alca} />
        <PlantaFoco fase={ULTIMA_FASE} tamanho={52} />
        <div className="text-left">
          <p className="text-sm font-extrabold">Sua árvore cresceu!</p>
          <p className="text-xs text-tinta-suave">{concluida} minutos de foco.</p>
          <Link href={PAGINA_FOCO} onClick={dispensarConclusao} className="text-xs font-bold text-primaria hover:underline">
            Ver meu jardim
          </Link>
        </div>
        <button
          type="button"
          onClick={dispensarConclusao}
          aria-label="Fechar"
          className="ml-1 self-start rounded-full px-1.5 text-tinta-suave hover:text-tinta"
        >
          ×
        </button>
      </div>
    );
  }

  if (!sessao) return null;
  const pausado = sessao.fimEm === null;
  const fase = faseDoProgresso(progressoDa(sessao, agora));

  return (
    <div ref={ref} style={estilo} className={caixa} aria-label="Modo foco">
      <Alca {...alca} />
      <Link href={PAGINA_FOCO} className="flex items-center gap-2" title="Abrir o modo foco">
        <PlantaFoco fase={fase} pausado={pausado} tamanho={40} />
        <span className="text-left">
          <span className="block text-lg leading-tight font-extrabold tabular-nums">{formatarTempo(restanteDa(sessao, agora))}</span>
          <span className="block text-xs font-semibold text-tinta-suave">{pausado ? "Pausado" : "Modo foco"}</span>
        </span>
      </Link>
      <button
        type="button"
        onClick={pausado ? retomar : pausar}
        className="rounded-full border-2 border-linha px-3 py-1 text-xs font-bold hover:border-tinta"
      >
        {pausado ? "Continuar" : "Pausar"}
      </button>
    </div>
  );
}
