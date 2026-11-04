import { caminhoLigacao, cores, desenharMapa, mapaEmTopicos, type Mapa } from "@/lib/mapas";

/** Desenha o mapa mental em SVG. Funciona no servidor e no editor (pré-visualização). */
export function MapaMental({ mapa, titulo, impressao }: { mapa: Mapa; titulo?: string; impressao?: boolean }) {
  const d = desenharMapa(mapa);
  const porId = new Map(d.caixas.map((c) => [c.id, c]));

  return (
    <figure className={impressao ? "" : "overflow-x-auto rounded-2xl border border-linha bg-fundo p-2"}>
      <svg
        viewBox={`0 0 ${d.largura} ${d.altura}`}
        width={d.largura}
        className={`mx-auto block h-auto max-w-full ${impressao ? "" : "min-w-[36rem]"}`}
        role="img"
        aria-label={titulo ?? mapa.centro}
      >
        <title>{mapaEmTopicos(mapa)}</title>
        <g fill="none" strokeLinecap="round">
          {d.ligacoes.map((l) => {
            const pai = porId.get(l.de)!;
            const filho = porId.get(l.para)!;
            return (
              <path
                key={l.para}
                d={caminhoLigacao(pai, filho)}
                stroke={cores[l.cor].traco}
                strokeWidth={filho.nivel === 1 ? 3 : 2}
                strokeOpacity={filho.nivel === 1 ? 0.9 : 0.6}
              />
            );
          })}
        </g>
        {d.caixas.map((c) => {
          const cor = c.cor ? cores[c.cor] : null;
          const tamanho = c.nivel === 0 ? 16 : c.nivel === 1 ? 14 : 13;
          const peso = c.nivel <= 1 ? 700 : 500;
          const fill = c.nivel === 0 ? "var(--tinta)" : c.nivel === 1 ? cor!.traco : cor!.fundo;
          const texto = c.nivel === 0 ? "var(--fundo)" : c.nivel === 1 ? "#ffffff" : "#10233a";
          const primeira = c.y + c.h / 2 - ((c.linhas.length - 1) * 18) / 2 + tamanho / 3;
          return (
            <g key={c.id}>
              <rect
                x={c.x}
                y={c.y}
                width={c.w}
                height={c.h}
                rx={c.nivel === 0 ? 18 : 12}
                fill={fill}
                stroke={c.nivel >= 2 ? cor!.traco : "none"}
                strokeOpacity={0.35}
              />
              <text
                x={c.x + c.w / 2}
                textAnchor="middle"
                fontSize={tamanho}
                fontWeight={peso}
                fill={texto}
                style={{ fontFamily: "var(--font-figtree), sans-serif" }}
              >
                {c.linhas.map((linha, i) => (
                  <tspan key={i} x={c.x + c.w / 2} y={primeira + i * 18}>
                    {linha}
                  </tspan>
                ))}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
