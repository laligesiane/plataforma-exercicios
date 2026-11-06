import type { ReactNode } from "react";
import type { ModoJogo } from "@/lib/documento/jogos";

// Ícones de traço, no mesmo estilo da barra de baixo. Nada de emoji na interface.

const traco = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

function Svg({ children, className = "size-5" }: { children: ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...traco}>
      {children}
    </svg>
  );
}

const caminhos = {
  cartoes: (
    <>
      <rect x="3" y="6" width="13" height="15" rx="2" />
      <path d="M8 3h11a2 2 0 0 1 2 2v12" />
    </>
  ),
  memoria: (
    <>
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
      <path d="M17.25 14.5v5.5M14.5 17.25h5.5" />
    </>
  ),
  quiz: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01" />
    </>
  ),
  complete: (
    <>
      <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z" />
      <path d="m13.5 6.5 4 4" />
    </>
  ),
  "verdadeiro-falso": (
    <>
      <path d="m1.5 12.5 3.5 3.5 6-8" />
      <path d="m14 7.5 8 8m0-8-8 8" />
    </>
  ),
  ligar: (
    <>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    </>
  ),
  jogos: (
    <>
      <path d="M6 8h12a4 4 0 0 1 4 4v1a4 4 0 0 1-7 2.6L14 15h-4l-1 .6A4 4 0 0 1 2 13v-1a4 4 0 0 1 4-4z" />
      <path d="M7 11v3M5.5 12.5h3M16 12h.01M18 13.5h.01" />
    </>
  ),
  fogo: <path d="M12 21a6 6 0 0 0 6-6c0-3.5-2.5-5.5-3.5-8-1 2-2 3-3.5 3 0-2.5-1-5-3-7 0 4-4 6.5-4 12a6 6 0 0 0 6 6z" />,
  relogio: (
    <>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2.5 2M10 2h4" />
    </>
  ),
  certo: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  errado: <path d="M6 6l12 12M18 6 6 18" />,
  pasta: <path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
  mais: <path d="M12 5v14M5 12h14" />,
  cadeado: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>
  ),
  brilho: <path d="M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7z" />,
  globo: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
    </>
  ),
} satisfies Record<ModoJogo | string, ReactNode>;

export type NomeIcone = keyof typeof caminhos;

export function Icone({ nome, className }: { nome: NomeIcone; className?: string }) {
  return <Svg className={className}>{caminhos[nome]}</Svg>;
}
