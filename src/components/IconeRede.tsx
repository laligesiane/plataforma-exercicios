import { caminhosRedes } from "@/lib/redesIcones";
import type { Rede } from "@/lib/paginaProfessor";

/** Ícone oficial da rede social, na cor do texto (currentColor). */
export function IconeRede({ rede, className = "size-5" }: { rede: Rede; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} shrink-0`} fill="currentColor" aria-hidden>
      <path d={caminhosRedes[rede]} />
    </svg>
  );
}

/** Cores das marcas, para o fundo dos botões da página pública. */
export const coresRedes: Record<Rede, string> = {
  whatsapp: "#25D366",
  instagram: "#E4405F",
  tiktok: "#000000",
  facebook: "#0866FF",
  youtube: "#FF0000",
};
