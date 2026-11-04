import type { Resultado } from "@/lib/correcao";

const estilos = {
  certo: { caixa: "bg-certo-fundo", cor: "bg-certo", titulo: "text-certo", icone: "✓", texto: "Certo!" },
  certo_com_aviso: { caixa: "bg-aviso-fundo", cor: "bg-aviso", titulo: "text-aviso", icone: "!", texto: "Certo, mas atenção." },
  errado: { caixa: "bg-erro-fundo", cor: "bg-erro", titulo: "text-erro", icone: "✕", texto: "Ainda não." },
} as const;

export function Feedback({ resultado }: { resultado: Resultado | null }) {
  if (!resultado) return null;

  const estilo = estilos[resultado.status];
  const explicacao = resultado.status === "certo_com_aviso" ? resultado.aviso : resultado.explicacao;

  return (
    <div role="status" className={`mt-3 flex items-start gap-2.5 rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${estilo.caixa}`}>
      <span
        aria-hidden
        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold text-white ${estilo.cor}`}
      >
        {estilo.icone}
      </span>
      <p>
        <strong className={`font-bold ${estilo.titulo}`}>{estilo.texto}</strong>
        {explicacao ? ` ${explicacao}` : null}
      </p>
    </div>
  );
}
