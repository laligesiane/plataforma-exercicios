/**
 * Brotinho, o mascote do Repasa: uma sementinha que cresce a cada revisão.
 * "feliz" é a pose do dia a dia: animado, ele pisca e balança as folhinhas devagar.
 * "lendo" é a pose dos carregamentos: animado, as folhas balançam e o corpinho respira.
 * Quem pede menos movimento no sistema vê o Brotinho parado.
 */
type Pose = "feliz" | "lendo";

export function Mascote({
  pose = "feliz",
  tamanho = 120,
  animado = false,
  className = "",
}: {
  pose?: Pose;
  tamanho?: number;
  animado?: boolean;
  className?: string;
}) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 120 120"
      className={`${animado ? (pose === "lendo" ? "brotinho-animado" : "brotinho-ocioso") : ""} ${className}`}
      role="img"
      aria-label="Brotinho, o mascote do Repasa"
    >
      <g className="brotinho-corpo">
        <g className="brotinho-folhas">
          <path d="M60 40 L60 23" stroke="#1f7a45" strokeWidth="4" strokeLinecap="round" />
          <path d="M60 24 C50 10 34 12 32 20 C42 28 54 28 60 24Z" fill="#34c38f" />
          <path d="M60 24 C70 8 88 10 90 18 C80 28 66 28 60 24Z" fill="#0f9d6b" />
        </g>
        <ellipse cx="60" cy="74" rx="38" ry="36" fill="#0f9d6b" />
        <ellipse cx="60" cy="82" rx="26" ry="22" fill="#e3f6ee" />
        {pose === "feliz" ? (
          <>
            <g className="brotinho-olhos">
              <circle cx="47" cy="66" r="7" fill="#fff" />
              <circle cx="73" cy="66" r="7" fill="#fff" />
              <circle cx="48.5" cy="67" r="3.6" fill="#10233a" />
              <circle cx="74.5" cy="67" r="3.6" fill="#10233a" />
              <circle cx="49.6" cy="65.6" r="1.2" fill="#fff" />
              <circle cx="75.6" cy="65.6" r="1.2" fill="#fff" />
            </g>
            <path d="M53 78 Q60 85 67 78" stroke="#10233a" strokeWidth="3" strokeLinecap="round" fill="none" />
            <circle cx="38" cy="78" r="4.5" fill="#ff9fb0" opacity=".7" />
            <circle cx="82" cy="78" r="4.5" fill="#ff9fb0" opacity=".7" />
          </>
        ) : (
          <>
            <path d="M41 66 Q47 61 53 66" stroke="#10233a" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M67 66 Q73 61 79 66" stroke="#10233a" strokeWidth="3" fill="none" strokeLinecap="round" />
            <circle cx="60" cy="78" r="3.2" fill="#10233a" />
            <circle cx="38" cy="74" r="4.5" fill="#ff9fb0" opacity=".7" />
            <circle cx="82" cy="74" r="4.5" fill="#ff9fb0" opacity=".7" />
            <g className="brotinho-livro">
              <path d="M60 88 Q46 82 30 85 V106 Q46 103 60 108Z" fill="#fff" stroke="#10233a" strokeWidth="2.5" strokeLinejoin="round" />
              <path d="M60 88 Q74 82 90 85 V106 Q74 103 60 108Z" fill="#fff" stroke="#10233a" strokeWidth="2.5" strokeLinejoin="round" />
              <path d="M36 92 Q46 90 54 93 M36 98 Q46 96 54 99 M66 93 Q74 90 84 92 M66 99 Q74 96 84 98" stroke="#7ccf9f" strokeWidth="2" fill="none" strokeLinecap="round" />
            </g>
          </>
        )}
        <ellipse cx="44" cy="110" rx="9" ry="5" fill="#1f7a45" />
        <ellipse cx="76" cy="110" rx="9" ry="5" fill="#1f7a45" />
      </g>
    </svg>
  );
}

/** Ícone do logo e do favicon: só o brotinho, em branco sobre o verde, com as folhinhas balançando devagar. */
export function IconeLogo({ tamanho = 34 }: { tamanho?: number }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 64 64" className="brotinho-ocioso shrink-0" aria-hidden>
      <rect width="64" height="64" rx="16" fill="#0f9d6b" className="logo-fundo" />
      <path d="M32 50 V28" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
      <g className="brotinho-folhas brotinho-folhas-icone">
        <path d="M32 31 C26 17 12 17 9 25 C17 34 27 35 32 31Z" fill="#fff" />
        <path d="M32 31 C38 15 53 15 56 23 C48 33 37 35 32 31Z" fill="#e3f6ee" className="logo-folha" />
      </g>
    </svg>
  );
}
