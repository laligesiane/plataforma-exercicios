/**
 * Brotinho, o mascote do Repasa: uma sementinha que cresce a cada revisão.
 * "feliz" é a pose parada; "lendo" é a pose dos carregamentos (folhas
 * balançando e corpinho respirando, sem animação para quem pede menos movimento).
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
      className={`${animado ? "brotinho-animado" : ""} ${className}`}
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
            <circle cx="47" cy="66" r="7" fill="#fff" />
            <circle cx="73" cy="66" r="7" fill="#fff" />
            <circle cx="48.5" cy="67" r="3.6" fill="#10233a" />
            <circle cx="74.5" cy="67" r="3.6" fill="#10233a" />
            <circle cx="49.6" cy="65.6" r="1.2" fill="#fff" />
            <circle cx="75.6" cy="65.6" r="1.2" fill="#fff" />
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

/** Ícone do logo: o Brotinho simplificado, em branco sobre o verde. */
export function IconeLogo({ tamanho = 32 }: { tamanho?: number }) {
  return (
    <span
      className="flex items-center justify-center rounded-[10px] bg-primaria"
      style={{ width: tamanho, height: tamanho }}
      aria-hidden
    >
      <svg width={tamanho * 0.76} height={tamanho * 0.76} viewBox="0 0 120 120">
        <path d="M60 52 L60 30" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
        <path d="M60 34 C48 14 26 16 22 28 C36 40 52 40 60 34Z" fill="#fff" />
        <path d="M60 34 C72 12 96 14 100 26 C86 40 68 40 60 34Z" fill="#e3f6ee" />
        <ellipse cx="60" cy="84" rx="34" ry="30" fill="#fff" />
      </svg>
    </span>
  );
}
