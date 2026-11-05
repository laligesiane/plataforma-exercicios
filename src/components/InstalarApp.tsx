"use client";

import { useEffect, useState } from "react";

type PedidoInstalar = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

/**
 * "Instalar o app": no Android/Chrome abre o pedido do navegador; no iPhone explica o caminho
 * pelo botão Compartilhar. Some quando a Repasa já está aberta como app.
 */
export function InstalarApp() {
  const [pedido, setPedido] = useState<PedidoInstalar | null>(null);
  const [modo, setModo] = useState<"nada" | "pedido" | "iphone">("nada");
  const [ajuda, setAjuda] = useState(false);

  useEffect(() => {
    const instalado =
      window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone;
    if (instalado) return;
    if (/iphone|ipad|ipod/i.test(navigator.userAgent)) setModo("iphone");
    const aoOferecer = (e: Event) => {
      e.preventDefault();
      setPedido(e as PedidoInstalar);
      setModo("pedido");
    };
    const aoInstalar = () => setModo("nada");
    window.addEventListener("beforeinstallprompt", aoOferecer);
    window.addEventListener("appinstalled", aoInstalar);
    return () => {
      window.removeEventListener("beforeinstallprompt", aoOferecer);
      window.removeEventListener("appinstalled", aoInstalar);
    };
  }, []);

  if (modo === "nada") return null;

  return (
    <div className="rounded-2xl border border-linha p-4 text-sm">
      <p className="font-bold">Repasa na tela inicial</p>
      <p className="mt-0.5 text-tinta-suave">Abre como um app, sem a barra do navegador.</p>
      {modo === "pedido" ? (
        <button
          type="button"
          onClick={async () => {
            await pedido?.prompt();
            const r = await pedido?.userChoice;
            if (r?.outcome === "accepted") setModo("nada");
          }}
          className="mt-3 rounded-full bg-primaria px-4 py-2 font-bold text-white"
        >
          Instalar o app
        </button>
      ) : ajuda ? (
        <p className="mt-3">
          Toque em <strong>Compartilhar</strong> (o quadrado com a seta para cima) e depois em <strong>Adicionar à Tela de Início</strong>.
        </p>
      ) : (
        <button type="button" onClick={() => setAjuda(true)} className="mt-3 font-bold text-primaria">
          Como instalar no iPhone
        </button>
      )}
    </div>
  );
}
