import { Mascote } from "@/components/Mascote";

/** Tela de carregamento com o Brotinho lendo, no lugar de esqueletos e barrinhas. */
export function Carregando({ texto = "Só um instante, estou organizando tudo…" }: { texto?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <Mascote pose="lendo" tamanho={112} animado />
      <p className="text-sm font-semibold text-tinta-suave">{texto}</p>
    </div>
  );
}
