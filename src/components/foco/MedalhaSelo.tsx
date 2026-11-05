import type { DefSelo } from "@/lib/foco/colecao";

/** Medalha redondinha de um selo do modo foco; apagada enquanto não foi conquistada. */
export function MedalhaSelo({ selo, conquistado = true, tamanho = 64 }: { selo: DefSelo; conquistado?: boolean; tamanho?: number }) {
  const cor = conquistado ? selo.cor : "#c9d2d9";
  const pequena = selo.marca.length > 2;
  return (
    <svg width={tamanho} height={(tamanho * 76) / 64} viewBox="0 0 64 76" aria-hidden className={conquistado ? "" : "opacity-70"}>
      <path d="M18 44 L10 74 L22 68 L28 76 L32 50Z" fill={conquistado ? "#e5578a" : "#dde3e8"} />
      <path d="M46 44 L54 74 L42 68 L36 76 L32 50Z" fill={conquistado ? "#5aa9e6" : "#dde3e8"} />
      <circle cx="32" cy="30" r="28" fill={cor} />
      <circle cx="32" cy="30" r="22" fill="#fff" opacity={conquistado ? 0.28 : 0.5} />
      <circle cx="32" cy="30" r="22" fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="3 4" opacity=".8" />
      <text
        x="32"
        y={pequena ? 36 : 38}
        textAnchor="middle"
        fontSize={pequena ? 17 : 22}
        fontWeight="900"
        fill={conquistado ? "#fff" : "#8a97a3"}
        fontFamily="inherit"
        style={conquistado ? { paintOrder: "stroke", stroke: "rgba(0,0,0,.12)", strokeWidth: 2 } : undefined}
      >
        {conquistado ? selo.marca : "?"}
      </text>
    </svg>
  );
}
