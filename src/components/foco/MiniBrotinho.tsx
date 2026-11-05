"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PlantaFoco } from "@/components/PlantaFoco";
import { faseDoProgresso, formatarTempo, progressoDa, restanteDa, ULTIMA_FASE } from "@/lib/foco";
import { useFoco } from "./FocoProvider";

const PAGINA_FOCO = "/aluno/foco";

/**
 * O Brotinho flutuante: acompanha o aluno pelas páginas da Repasa enquanto o foco está ligado
 * e comemora quando a árvore fica pronta. Some na própria página do modo foco.
 */
export function MiniBrotinho() {
  const { sessao, agora, concluida, pausar, retomar, dispensarConclusao } = useFoco();
  const caminho = usePathname();
  if (caminho === PAGINA_FOCO) return null;

  const caixa =
    "fixed right-4 bottom-4 z-50 flex items-center gap-3 rounded-2xl border border-linha bg-fundo py-2 pr-3 pl-2 shadow-lg shadow-black/10";

  if (concluida !== null && !sessao) {
    return (
      <div role="status" className={caixa}>
        <PlantaFoco fase={ULTIMA_FASE} tamanho={52} />
        <div className="text-left">
          <p className="text-sm font-extrabold">Sua árvore cresceu!</p>
          <p className="text-xs text-tinta-suave">{concluida} minutos de foco.</p>
          <Link href={PAGINA_FOCO} onClick={dispensarConclusao} className="text-xs font-bold text-primaria hover:underline">
            Ver meu jardim
          </Link>
        </div>
        <button
          type="button"
          onClick={dispensarConclusao}
          aria-label="Fechar"
          className="ml-1 self-start rounded-full px-1.5 text-tinta-suave hover:text-tinta"
        >
          ×
        </button>
      </div>
    );
  }

  if (!sessao) return null;
  const pausado = sessao.fimEm === null;
  const fase = faseDoProgresso(progressoDa(sessao, agora));

  return (
    <div className={caixa} aria-label="Modo foco">
      <Link href={PAGINA_FOCO} className="flex items-center gap-2" title="Abrir o modo foco">
        <PlantaFoco fase={fase} pausado={pausado} tamanho={52} />
        <span className="text-left">
          <span className="block text-lg leading-tight font-extrabold tabular-nums">{formatarTempo(restanteDa(sessao, agora))}</span>
          <span className="block text-xs font-semibold text-tinta-suave">{pausado ? "Pausado" : "Modo foco"}</span>
        </span>
      </Link>
      <button
        type="button"
        onClick={pausado ? retomar : pausar}
        className="rounded-full border-2 border-linha px-3 py-1 text-xs font-bold hover:border-tinta"
      >
        {pausado ? "Continuar" : "Pausar"}
      </button>
    </div>
  );
}
