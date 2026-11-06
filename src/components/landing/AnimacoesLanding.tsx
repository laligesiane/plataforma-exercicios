"use client";

import { useEffect } from "react";

/**
 * Faz os blocos marcados com data-surgir aparecerem suavemente quando entram na tela.
 * Sem JavaScript, ou para quem pede menos movimento no sistema, tudo já aparece de uma vez.
 * O que já está visível ao abrir a página aparece na hora, para não piscar.
 */
export function AnimacoesLanding() {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const blocos = document.querySelectorAll<HTMLElement>("[data-surgir]");
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue;
          entrada.target.classList.add("surgiu");
          observador.unobserve(entrada.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );

    blocos.forEach((bloco) => {
      if (bloco.getBoundingClientRect().top < window.innerHeight * 0.9) bloco.classList.add("surgiu");
      else observador.observe(bloco);
    });
    document.documentElement.classList.add("landing-anima");

    return () => {
      observador.disconnect();
      document.documentElement.classList.remove("landing-anima");
    };
  }, []);

  return null;
}
