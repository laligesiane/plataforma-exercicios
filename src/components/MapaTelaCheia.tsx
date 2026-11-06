"use client";

import { fmt } from "@/i18n/config";
import { useDicionario } from "@/i18n/cliente";
import { useEffect, useRef, useState, type ReactNode } from "react";

const MIN = 0.4;
const MAX = 4;
const limitar = (z: number) => Math.min(MAX, Math.max(MIN, z));

/**
 * Botão "Tela cheia" do mapa mental. Na tela cheia dá para arrastar com um dedo,
 * aproximar com a pinça (ou a rodinha do mouse) e usar os botões + e −.
 */
export function MapaTelaCheia({ children, titulo }: { children: ReactNode; titulo?: string }) {
  const tx = useDicionario().resumo;
  const [aberto, setAberto] = useState(false);
  const [vista, setVista] = useState({ x: 0, y: 0, z: 1 });
  const dedos = useRef(new Map<number, { x: number; y: number }>());
  const area = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const fechar = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    window.addEventListener("keydown", fechar);
    return () => {
      document.body.style.overflow = antes;
      window.removeEventListener("keydown", fechar);
    };
  }, [aberto]);

  // A rodinha precisa de listener não passivo para não rolar a página por trás.
  useEffect(() => {
    const el = area.current;
    if (!aberto || !el) return;
    const roda = (e: WheelEvent) => {
      e.preventDefault();
      setVista((v) => ({ ...v, z: limitar(v.z * (e.deltaY < 0 ? 1.1 : 1 / 1.1)) }));
    };
    el.addEventListener("wheel", roda, { passive: false });
    return () => el.removeEventListener("wheel", roda);
  }, [aberto]);

  function abrir() {
    setVista({ x: 0, y: 0, z: 1 });
    setAberto(true);
  }

  function aoMover(e: React.PointerEvent) {
    const anterior = dedos.current.get(e.pointerId);
    if (!anterior) return;
    const atual = { x: e.clientX, y: e.clientY };
    if (dedos.current.size === 1) {
      setVista((v) => ({ ...v, x: v.x + atual.x - anterior.x, y: v.y + atual.y - anterior.y }));
    } else if (dedos.current.size === 2) {
      const outro = [...dedos.current.entries()].find(([id]) => id !== e.pointerId)?.[1];
      if (outro) {
        const antes = Math.hypot(anterior.x - outro.x, anterior.y - outro.y);
        const agora = Math.hypot(atual.x - outro.x, atual.y - outro.y);
        if (antes > 0) setVista((v) => ({ ...v, z: limitar(v.z * (agora / antes)) }));
      }
    }
    dedos.current.set(e.pointerId, atual);
  }

  const soltar = (e: React.PointerEvent) => dedos.current.delete(e.pointerId);
  const botao = "flex size-11 items-center justify-center rounded-full border border-linha bg-fundo text-xl font-extrabold shadow";

  return (
    <>
      <button type="button" onClick={abrir} className="mb-2 text-sm font-bold text-primaria hover:underline print:hidden">
        ⛶ {tx.verTelaCheia}
      </button>
      {children}
      {aberto && (
        <div role="dialog" aria-modal="true" aria-label={titulo ? fmt(tx.mapaDe, { titulo }) : tx.mapaMental} className="fixed inset-0 z-[60] flex flex-col bg-fundo">
          <div className="flex items-center justify-between gap-3 border-b border-linha px-4 py-3">
            <p className="min-w-0 truncate font-extrabold">{titulo ?? tx.mapaMental}</p>
            <button type="button" onClick={() => setAberto(false)} className="rounded-full border-2 border-linha px-4 py-1 font-bold">
              {tx.fechar}
            </button>
          </div>
          <div
            ref={area}
            className="relative flex-1 touch-none overflow-hidden select-none"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              dedos.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
            }}
            onPointerMove={aoMover}
            onPointerUp={soltar}
            onPointerCancel={soltar}
          >
            <div
              className="mapa-tela-cheia absolute inset-0 flex items-center justify-center p-4"
              style={{ transform: `translate(${vista.x}px, ${vista.y}px) scale(${vista.z})` }}
            >
              {children}
            </div>
          </div>
          <div className="absolute right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] flex flex-col gap-2">
            <button type="button" aria-label={tx.aproximar} onClick={() => setVista((v) => ({ ...v, z: limitar(v.z * 1.25) }))} className={botao}>
              +
            </button>
            <button type="button" aria-label={tx.afastar} onClick={() => setVista((v) => ({ ...v, z: limitar(v.z / 1.25) }))} className={botao}>
              −
            </button>
            <button type="button" aria-label={tx.centralizar} onClick={() => setVista({ x: 0, y: 0, z: 1 })} className={`${botao} text-sm`}>
              ⟲
            </button>
          </div>
          <p className="pointer-events-none absolute bottom-[calc(1rem+env(safe-area-inset-bottom))] left-4 text-xs text-tinta-suave">
            {tx.dicaArrastar}
          </p>
        </div>
      )}
    </>
  );
}
