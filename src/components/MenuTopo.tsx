"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { sair } from "@/app/entrar/actions";
import { abaAtiva, abasAluno, abasProfessor, icones, maisAluno, type Item } from "@/components/navegacao";

/** Fecha um menu suspenso ao clicar fora, apertar Esc ou trocar de página. */
function useSuspenso() {
  const [aberto, setAberto] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);
  const caminho = usePathname();

  useEffect(() => setAberto(false), [caminho]);
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

  return { aberto, setAberto, caixa };
}

const estiloAba = (ativa: boolean) =>
  `flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-bold transition-colors [&_svg]:size-5 ${
    ativa ? "bg-primaria-suave text-primaria" : "text-tinta-suave hover:bg-suave hover:text-tinta"
  }`;

function Suspenso({ rotulo, botao, ativo, largura = "w-60", children }: { rotulo: string; botao: ReactNode; ativo?: boolean; largura?: string; children: ReactNode }) {
  const { aberto, setAberto, caixa } = useSuspenso();
  return (
    <div ref={caixa} className="relative">
      <button type="button" onClick={() => setAberto((v) => !v)} aria-expanded={aberto} aria-haspopup="menu" aria-label={rotulo} className={estiloAba(aberto || Boolean(ativo))}>
        {botao}
      </button>
      {aberto && (
        <div role="menu" className={`absolute right-0 z-40 mt-2 ${largura} rounded-2xl border border-linha bg-fundo p-2 shadow-xl`}>
          {children}
        </div>
      )}
    </div>
  );
}

function ItemMenu({ item, caminho }: { item: Item; caminho: string }) {
  const ativo = abaAtiva(caminho, item.href);
  return (
    <Link
      href={item.href}
      role="menuitem"
      aria-current={ativo ? "page" : undefined}
      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold text-tinta hover:bg-suave aria-[current]:bg-primaria-suave aria-[current]:text-primaria [&_svg]:size-5 [&_svg]:text-primaria"
    >
      {item.icone}
      {item.rotulo}
    </Link>
  );
}

/**
 * Menu do topo no computador e no tablet: as abas principais com ícone (o texto aparece a partir de 768px),
 * "Mais" com o resto das páginas do aluno e o menu da conta (Perfil e Sair).
 */
export function MenuTopo({ papel, nome, comPraticas = false }: { papel: "aluno" | "professor"; nome: string | null; comPraticas?: boolean }) {
  const caminho = usePathname();
  const abas = papel === "aluno" ? abasAluno : abasProfessor.filter((a) => a.href !== "/perfil");
  const mais = papel === "aluno" ? maisAluno(comPraticas) : [];
  const inicial = (nome?.trim()[0] ?? "?").toUpperCase();

  return (
    <div className="flex items-center gap-1">
      <nav aria-label="Menu principal">
        <ul className="flex items-center gap-0.5">
          {abas.map((a) => {
            const ativa = abaAtiva(caminho, a.href);
            return (
              <li key={a.href}>
                <Link href={a.href} aria-current={ativa ? "page" : undefined} title={a.rotulo} className={estiloAba(ativa)}>
                  {a.icone}
                  <span className="sr-only md:not-sr-only">{a.rotulo}</span>
                </Link>
              </li>
            );
          })}
          {mais.length > 0 && (
            <li>
              <Suspenso
                rotulo="Mais páginas"
                ativo={mais.some((m) => abaAtiva(caminho, m.href))}
                botao={
                  <>
                    {icones.mais}
                    <span className="hidden md:inline">Mais</span>
                    {icones.seta}
                  </>
                }
              >
                {mais.map((m) => (
                  <ItemMenu key={m.href} item={m} caminho={caminho} />
                ))}
              </Suspenso>
            </li>
          )}
        </ul>
      </nav>
      <div className="esconder-no-foco ml-1">
        <Suspenso
          rotulo="Minha conta"
          ativo={caminho.startsWith("/perfil")}
          largura="w-52"
          botao={
            <span className="flex size-8 items-center justify-center rounded-full bg-primaria text-sm font-extrabold text-white" aria-hidden>
              {inicial}
            </span>
          }
        >
          {nome && <p className="truncate px-3 pt-1 pb-2 text-xs font-bold text-tinta-suave">{nome}</p>}
          <ItemMenu item={{ href: "/perfil", rotulo: "Perfil", icone: icones.perfil }} caminho={caminho} />
          <form action={sair}>
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-bold text-tinta hover:bg-suave [&_svg]:size-5 [&_svg]:text-tinta-suave"
            >
              {icones.sair}
              Sair
            </button>
          </form>
        </Suspenso>
      </div>
    </div>
  );
}
