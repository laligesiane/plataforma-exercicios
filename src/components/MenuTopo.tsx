"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { sair } from "@/app/entrar/actions";
import { Avatar } from "@/components/Avatar";
import { useDicionario } from "@/i18n/cliente";
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
  `flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm lg:px-3.5 font-bold transition-colors [&_svg]:size-5 ${
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
  const d = useDicionario();
  const ativo = abaAtiva(caminho, item.href);
  return (
    <Link
      href={item.href}
      role="menuitem"
      aria-current={ativo ? "page" : undefined}
      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold text-tinta hover:bg-suave aria-[current]:bg-primaria-suave aria-[current]:text-primaria [&_svg]:size-5 [&_svg]:text-primaria"
    >
      {item.icone}
      {d.menu[item.chave]}
    </Link>
  );
}

/**
 * Abas do topo no computador e no tablet, no centro do cabeçalho: as principais com ícone
 * (o texto aparece a partir de 768px) e "Mais" com o resto das páginas do aluno.
 */
export function MenuPrincipal({ papel, comPraticas = false }: { papel: "aluno" | "professor"; comPraticas?: boolean }) {
  const caminho = usePathname();
  const d = useDicionario();
  const abas = papel === "aluno" ? abasAluno : abasProfessor.filter((a) => a.href !== "/perfil");
  const mais = papel === "aluno" ? maisAluno(comPraticas) : [];

  return (
    <nav aria-label={d.menu.principal}>
      <ul className="flex items-center gap-0.5 lg:gap-2">
        {abas.map((a) => {
          const ativa = abaAtiva(caminho, a.href);
          return (
            <li key={a.href}>
              <Link href={a.href} aria-current={ativa ? "page" : undefined} title={d.menu[a.chave]} className={estiloAba(ativa)}>
                {a.icone}
                <span className="sr-only md:not-sr-only">{d.menu[a.chave]}</span>
              </Link>
            </li>
            );
          })}
          {mais.length > 0 && (
            <li>
              <Suspenso
                rotulo={d.menu.maisPaginas}
                ativo={mais.some((m) => abaAtiva(caminho, m.href))}
                botao={
                  <>
                    {icones.mais}
                    <span className="hidden md:inline">{d.menu.mais}</span>
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
  );
}

/** Foto (ou bolinha com a inicial), no canto direito: Perfil e Sair. */
export function MenuConta({ nome, foto }: { nome: string | null; foto?: string | null }) {
  const caminho = usePathname();
  const d = useDicionario();

  return (
    <div className="esconder-no-foco">
      <Suspenso
        rotulo={d.menu.minhaConta}
        ativo={caminho.startsWith("/perfil")}
        largura="w-52"
        botao={
          <Avatar nome={nome} foto={foto} />
        }
      >
        {nome && <p className="truncate px-3 pt-1 pb-2 text-xs font-bold text-tinta-suave">{nome}</p>}
        <ItemMenu item={{ href: "/perfil", chave: "perfil", icone: icones.perfil }} caminho={caminho} />
        <form action={sair}>
          <button
            type="submit"
            role="menuitem"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-bold text-tinta hover:bg-suave [&_svg]:size-5 [&_svg]:text-tinta-suave"
          >
            {icones.sair}
            {d.menu.sair}
          </button>
        </form>
      </Suspenso>
    </div>
  );
}
