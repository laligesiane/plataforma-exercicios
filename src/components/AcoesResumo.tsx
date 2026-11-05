"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { Icone } from "@/components/jogos/Icones";

const traco = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const Svg = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" className="size-4.5 shrink-0" aria-hidden {...traco}>
    {children}
  </svg>
);
const lapis = (
  <Svg>
    <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z" />
    <path d="m13.5 6.5 4 4" />
  </Svg>
);
const pontos = (
  <svg viewBox="0 0 24 24" className="size-5" aria-hidden fill="currentColor">
    <circle cx="5" cy="12" r="1.8" />
    <circle cx="12" cy="12" r="1.8" />
    <circle cx="19" cy="12" r="1.8" />
  </svg>
);
const baixar = (
  <Svg>
    <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
  </Svg>
);
const lixeira = (
  <Svg>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
  </Svg>
);

const pilula = "inline-flex h-9 items-center gap-1.5 rounded-full border-2 px-3.5 text-sm font-bold transition-colors";
const itemMenu = "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-bold hover:bg-suave disabled:opacity-60";

type Pdf = { incluir: string; rotulo: string };

/**
 * Ações do resumo numa barra só: "Cartões e jogos" e "Editar" à vista e o resto (gerar mapa, baixar PDF, excluir)
 * no menu de três pontinhos. No modo foco ficam só as opções de PDF.
 */
export function AcoesResumo({
  id,
  materiaId,
  temTexto,
  temMapa,
  gerarMapa,
  excluir,
}: {
  id: string;
  materiaId: string | null;
  temTexto: boolean;
  temMapa: boolean;
  gerarMapa?: () => Promise<{ erro: string } | void>;
  excluir?: (formData: FormData) => void | Promise<void>;
}) {
  const [aberto, setAberto] = useState(false);
  const [aviso, setAviso] = useState("");
  const [gerando, iniciar] = useTransition();
  const caixa = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: PointerEvent) => !caixa.current?.contains(e.target as Node) && setAberto(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    document.addEventListener("pointerdown", fora);
    window.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", fora);
      window.removeEventListener("keydown", esc);
    };
  }, [aberto]);

  const pdfs = [
    temTexto && temMapa && { incluir: "tudo", rotulo: "Resumo e mapa mental" },
    temTexto && { incluir: "resumo", rotulo: "Só o resumo" },
    temMapa && { incluir: "mapa", rotulo: "Só o mapa mental" },
  ].filter(Boolean) as Pdf[];
  const podeGerar = Boolean(gerarMapa && materiaId && temTexto);
  const temMenu = pdfs.length > 0 || podeGerar || Boolean(excluir && materiaId);

  function gerar() {
    setAberto(false);
    if (temMapa && !window.confirm("Trocar o mapa mental atual pelo mapa gerado a partir do resumo?")) return;
    iniciar(async () => {
      const r = await gerarMapa!();
      setAviso(r?.erro ?? "Mapa gerado. Ele aparece no fim do resumo.");
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        {temTexto && (
          <Link href={`/aluno/resumos/${id}/jogar`} className={`${pilula} esconder-no-foco border-primaria-suave bg-primaria-suave text-primaria hover:border-primaria`}>
            <Icone nome="jogos" className="size-4.5" />
            Cartões e jogos
          </Link>
        )}
        {materiaId && (
          <Link href={`/aluno/materias/${materiaId}/resumos/${id}`} className={`${pilula} esconder-no-foco border-linha px-2 text-tinta hover:border-primaria hover:text-primaria sm:px-3.5`}>
            {lapis}
            <span className="hidden sm:inline">Editar</span>
            <span className="sr-only sm:hidden">Editar</span>
          </Link>
        )}
        {temMenu && (
          <div ref={caixa} className="relative">
            <button
              type="button"
              onClick={() => setAberto((v) => !v)}
              aria-expanded={aberto}
              aria-haspopup="menu"
              aria-label="Mais ações do resumo"
              title="Mais ações"
              className={`flex size-9 items-center justify-center rounded-full border-2 transition-colors ${
                aberto ? "border-primaria text-primaria" : "border-linha text-tinta-suave hover:border-primaria hover:text-primaria"
              }`}
            >
              {pontos}
            </button>
            {aberto && (
              <div role="menu" className="absolute right-0 z-30 mt-2 w-64 rounded-2xl border border-linha bg-fundo p-1.5 shadow-xl">
                {podeGerar && (
                  <button type="button" role="menuitem" onClick={gerar} disabled={gerando} className={`${itemMenu} esconder-no-foco`}>
                    <Icone nome="brilho" className="size-4.5 text-primaria" />
                    {gerando ? "Gerando..." : temMapa ? "Gerar o mapa de novo" : "Gerar mapa mental"}
                  </button>
                )}
                {pdfs.length > 0 && (
                  <>
                    <p className="px-3 pt-2 pb-1 text-xs font-bold tracking-wide text-tinta-suave uppercase">Baixar em PDF</p>
                    {pdfs.map((p) => (
                      <a
                        key={p.incluir}
                        role="menuitem"
                        href={`/resumos/${id}/pdf?incluir=${p.incluir}`}
                        target="_blank"
                        rel="noopener"
                        onClick={() => setAberto(false)}
                        className={itemMenu}
                      >
                        <span className="text-primaria">{baixar}</span>
                        {p.rotulo}
                      </a>
                    ))}
                  </>
                )}
                {excluir && materiaId && (
                  <form
                    action={excluir}
                    onSubmit={(e) => {
                      if (!window.confirm("Excluir este resumo e o mapa mental dele? Não dá para desfazer.")) e.preventDefault();
                    }}
                    className="esconder-no-foco mt-1 border-t border-linha pt-1"
                  >
                    <input type="hidden" name="id" value={id} />
                    <input type="hidden" name="materia_id" value={materiaId} />
                    <button type="submit" role="menuitem" className={`${itemMenu} text-erro hover:bg-erro-fundo`}>
                      {lixeira}
                      Excluir resumo
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      {(aviso || gerando) && (
        <p role="status" className="text-sm text-tinta-suave">
          {gerando ? "Gerando o mapa..." : aviso}
        </p>
      )}
    </div>
  );
}
