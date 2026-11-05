import { FASES, ULTIMA_FASE } from "@/lib/foco";

const TINTA = "#10233a";

function Rosto({ x, y, escala = 1, dormindo = false }: { x: number; y: number; escala?: number; dormindo?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${escala})`}>
      {dormindo ? (
        <>
          <path d="M-15 0 Q-10 4 -5 0" stroke={TINTA} strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <path d="M5 0 Q10 4 15 0" stroke={TINTA} strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <path d="M-3 9 Q0 11 3 9" stroke={TINTA} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <g className="foco-olhos">
          <circle cx="-10" cy="0" r="5.6" fill="#fff" />
          <circle cx="10" cy="0" r="5.6" fill="#fff" />
          <circle cx="-8.8" cy="0.8" r="2.9" fill={TINTA} />
          <circle cx="11.2" cy="0.8" r="2.9" fill={TINTA} />
          <circle cx="-7.9" cy="-0.3" r="1" fill="#fff" />
          <circle cx="12.1" cy="-0.3" r="1" fill="#fff" />
          <path d="M-5 9 Q0 14 5 9" stroke={TINTA} strokeWidth="2.6" fill="none" strokeLinecap="round" />
        </g>
      )}
      <circle cx="-19" cy="8" r="3.6" fill="#ff9fb0" opacity=".7" />
      <circle cx="19" cy="8" r="3.6" fill="#ff9fb0" opacity=".7" />
    </g>
  );
}

function Terra({ raizes = 0 }: { raizes?: number }) {
  return (
    <g>
      <path d="M0 158 Q50 150 100 156 T200 154 V240 H0Z" fill="#8a5a3b" />
      <path d="M0 158 Q50 150 100 156 T200 154 V164 Q150 160 100 166 T0 166Z" fill="#6fcf97" />
      <circle cx="30" cy="196" r="3" fill="#6e4529" />
      <circle cx="168" cy="186" r="4" fill="#6e4529" />
      <circle cx="150" cy="222" r="2.5" fill="#6e4529" />
      <circle cx="46" cy="226" r="3.5" fill="#6e4529" />
      {raizes > 0 && (
        <g stroke="#5b3a22" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".75">
          <path d="M100 166 Q96 182 88 192" />
          <path d="M100 166 Q106 184 114 194" />
          {raizes > 1 && (
            <>
              <path d="M92 168 Q76 180 66 200" />
              <path d="M108 168 Q124 182 134 204" />
              <path d="M100 170 Q100 196 98 214" />
            </>
          )}
        </g>
      )}
    </g>
  );
}

/** Corpinho redondo do Brotinho (a semente). */
function Corpo({ cx, cy, rx, ry }: { cx: number; cy: number; rx: number; ry: number }) {
  return (
    <>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#0f9d6b" />
      <ellipse cx={cx} cy={cy + ry * 0.22} rx={rx * 0.68} ry={ry * 0.6} fill="#e3f6ee" />
    </>
  );
}

function Folha({ d, cor }: { d: string; cor: string }) {
  return <path d={d} fill={cor} />;
}

function Flor({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 4} cy={Math.sin((a * Math.PI) / 180) * 4} r="3.4" fill="#ffc2cf" />
      ))}
      <circle r="2.4" fill="#ffd166" />
    </g>
  );
}

/**
 * O Brotinho do modo foco, em seis fases: ele começa como semente dormindo embaixo da terra,
 * acorda e solta um broto, sai da terra, vira plantinha, árvore jovem e, no fim, uma árvore florida.
 * "pausado" deixa a carinha com sono (quando o aluno sai da página ou pausa).
 */
export function PlantaFoco({
  fase,
  pausado = false,
  tamanho = 240,
  animado = true,
  className = "",
}: {
  fase: number;
  pausado?: boolean;
  tamanho?: number;
  animado?: boolean;
  className?: string;
}) {
  const f = Math.max(0, Math.min(ULTIMA_FASE, Math.round(fase)));
  return (
    <svg
      width={tamanho}
      height={(tamanho * 240) / 200}
      viewBox="0 0 200 240"
      className={`${animado && !pausado ? "foco-vivo" : ""} ${className}`}
      role="img"
      aria-label={`Brotinho na fase ${FASES[f].nome.toLowerCase()}`}
    >
      {f === 0 && (
        <>
          <Terra />
          <Corpo cx={100} cy={200} rx={26} ry={23} />
          <Rosto x={100} y={196} escala={0.75} dormindo />
          <g fill={TINTA} opacity=".55" fontFamily="inherit" fontWeight="800">
            <text x="130" y="186" fontSize="12">z</text>
            <text x="140" y="174" fontSize="9">z</text>
          </g>
        </>
      )}

      {f === 1 && (
        <>
          <Terra />
          <path d="M100 178 L100 140" stroke="#1f7a45" strokeWidth="4" strokeLinecap="round" />
          <g className="foco-balanca" style={{ transformOrigin: "100px 142px" }}>
            <Folha d="M100 142 C93 132 82 133 80 139 C87 145 95 145 100 142Z" cor="#34c38f" />
            <Folha d="M100 142 C107 131 119 132 121 138 C114 145 105 145 100 142Z" cor="#0f9d6b" />
          </g>
          <Corpo cx={100} cy={198} rx={26} ry={23} />
          <Rosto x={100} y={194} escala={0.75} dormindo={pausado} />
        </>
      )}

      {f === 2 && (
        <>
          <Terra raizes={1} />
          <path d="M100 116 L100 98" stroke="#1f7a45" strokeWidth="4" strokeLinecap="round" />
          <g className="foco-balanca" style={{ transformOrigin: "100px 100px" }}>
            <Folha d="M100 100 C90 86 74 88 72 96 C82 104 94 104 100 100Z" cor="#34c38f" />
            <Folha d="M100 100 C110 84 128 86 130 94 C120 104 106 104 100 100Z" cor="#0f9d6b" />
          </g>
          <Corpo cx={100} cy={140} rx={32} ry={29} />
          <Rosto x={100} y={134} escala={0.9} dormindo={pausado} />
        </>
      )}

      {f === 3 && (
        <>
          <Terra raizes={1} />
          <path d="M100 118 C98 96 102 80 100 54" stroke="#1f7a45" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          <Folha d="M99 96 C88 86 74 88 70 96 C80 104 92 104 99 96Z" cor="#34c38f" />
          <Folha d="M101 84 C112 72 128 74 132 82 C122 92 108 92 101 84Z" cor="#0f9d6b" />
          <g className="foco-balanca" style={{ transformOrigin: "100px 58px" }}>
            <Folha d="M100 58 C90 42 72 44 70 53 C80 62 94 62 100 58Z" cor="#34c38f" />
            <Folha d="M100 58 C110 40 130 42 132 51 C122 62 106 62 100 58Z" cor="#0f9d6b" />
          </g>
          <Corpo cx={100} cy={140} rx={33} ry={30} />
          <Rosto x={100} y={134} escala={0.92} dormindo={pausado} />
        </>
      )}

      {f === 4 && (
        <>
          <Terra raizes={2} />
          <path d="M92 162 C94 140 92 124 96 104 L104 104 C108 124 106 140 108 162Z" fill="#9a6b47" />
          <path d="M100 128 Q114 120 120 108" stroke="#9a6b47" strokeWidth="5" strokeLinecap="round" fill="none" />
          <g className="foco-balanca" style={{ transformOrigin: "100px 104px" }}>
            <circle cx="100" cy="76" r="40" fill="#0f9d6b" />
            <circle cx="72" cy="88" r="20" fill="#0f9d6b" />
            <circle cx="128" cy="88" r="20" fill="#0f9d6b" />
            <circle cx="88" cy="62" r="16" fill="#34c38f" opacity=".55" />
          </g>
          <Rosto x={100} y={82} escala={1.05} dormindo={pausado} />
        </>
      )}

      {f === 5 && (
        <>
          <Terra raizes={2} />
          <path d="M88 162 C92 136 90 118 94 96 L106 96 C110 118 108 136 112 162Z" fill="#9a6b47" />
          <path d="M98 130 Q80 118 72 104" stroke="#9a6b47" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M102 120 Q120 112 128 98" stroke="#9a6b47" strokeWidth="6" strokeLinecap="round" fill="none" />
          <g className="foco-balanca" style={{ transformOrigin: "100px 100px" }}>
            <circle cx="100" cy="64" r="48" fill="#0f9d6b" />
            <circle cx="60" cy="86" r="28" fill="#0f9d6b" />
            <circle cx="140" cy="86" r="28" fill="#0f9d6b" />
            <circle cx="78" cy="40" r="24" fill="#0f9d6b" />
            <circle cx="122" cy="40" r="24" fill="#0f9d6b" />
            <circle cx="82" cy="44" r="18" fill="#34c38f" opacity=".55" />
            <circle cx="56" cy="80" r="12" fill="#34c38f" opacity=".45" />
            <Flor x={62} y={64} />
            <Flor x={140} y={70} />
            <Flor x={118} y={28} />
            <Flor x={74} y={100} />
            <Flor x={150} y={98} />
            <Flor x={92} y={22} />
          </g>
          <Rosto x={100} y={74} escala={1.15} dormindo={pausado} />
        </>
      )}
    </svg>
  );
}
