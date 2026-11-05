"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { sair } from "@/app/entrar/actions";
import { PainelLeitura } from "@/components/PreferenciasLeitura";
import { InstalarApp } from "@/components/InstalarApp";

type Item = { href: string; rotulo: string; icone: ReactNode };

const traco = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const Icone = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" className="size-6" aria-hidden {...traco}>
    {children}
  </svg>
);

const icones = {
  inicio: (
    <Icone>
      <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
    </Icone>
  ),
  atividades: (
    <Icone>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="m8 12 2.5 2.5L16 9" />
    </Icone>
  ),
  repasar: (
    <Icone>
      <path d="M4 12a8 8 0 0 1 14-5.3L20 9M20 4v5h-5M20 12a8 8 0 0 1-14 5.3L4 15M4 20v-5h5" />
    </Icone>
  ),
  resumos: (
    <Icone>
      <path d="M5 4h10l4 4v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" />
      <path d="M8 12h8M8 16h5" />
    </Icone>
  ),
  turmas: (
    <Icone>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6" />
    </Icone>
  ),
  perfil: (
    <Icone>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </Icone>
  ),
  mais: (
    <Icone>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </Icone>
  ),
};

const abasAluno: Item[] = [
  { href: "/aluno", rotulo: "Início", icone: icones.inicio },
  { href: "/aluno/atividades", rotulo: "Atividades", icone: icones.atividades },
  { href: "/aluno/revisar", rotulo: "Repasar", icone: icones.repasar },
  { href: "/aluno/resumos", rotulo: "Resumos", icone: icones.resumos },
];

const abasProfessor: Item[] = [
  { href: "/professor", rotulo: "Turmas", icone: icones.turmas },
  { href: "/professor/atividades", rotulo: "Atividades", icone: icones.atividades },
  { href: "/biblioteca", rotulo: "Biblioteca", icone: icones.resumos },
  { href: "/perfil", rotulo: "Perfil", icone: icones.perfil },
];

const maisAluno = (comPraticas: boolean) =>
  [
    { href: "/aluno/materias", rotulo: "Matérias" },
    { href: "/aluno/mapas", rotulo: "Mapas mentais" },
    ...(comPraticas ? [{ href: "/aluno/praticas", rotulo: "Práticas" }] : []),
    { href: "/aluno/agenda", rotulo: "Agenda" },
    { href: "/aluno/foco", rotulo: "Modo foco" },
    { href: "/perfil", rotulo: "Perfil" },
  ];

/**
 * Telas em que a barra some no celular: quem está resolvendo, estudando cartões ou editando
 * já tem os próprios botões presos embaixo, e a barra só atrapalharia.
 */
export function semBarra(caminho: string) {
  return (
    /^\/atividades\/[^/]+/.test(caminho) ||
    /^\/aluno\/resumos\/[^/]+\/(cartoes|jogar|praticar)/.test(caminho) ||
    /^\/aluno\/praticas\/[^/]+/.test(caminho) ||
    /^\/aluno\/revisar\/.+/.test(caminho) ||
    /^\/professor\/atividades\/[^/]+$/.test(caminho) ||
    /\/editar$|\/novo$/.test(caminho)
  );
}

export function abaAtiva(caminho: string, href: string) {
  return href === "/aluno" || href === "/professor" ? caminho === href || (href === "/professor" && caminho.startsWith("/professor/turmas")) : caminho.startsWith(href);
}

/** Barra de abas presa embaixo, só no celular. "Mais" abre uma folha com o resto do menu, a leitura e o Sair. */
export function BarraInferior({ papel, comPraticas = false }: { papel: "aluno" | "professor"; comPraticas?: boolean }) {
  const caminho = usePathname();
  const [aberto, setAberto] = useState(false);

  useEffect(() => setAberto(false), [caminho]);
  useEffect(() => {
    if (!aberto) return;
    const fechar = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    window.addEventListener("keydown", fechar);
    return () => window.removeEventListener("keydown", fechar);
  }, [aberto]);

  if (semBarra(caminho)) return null;

  const abas = papel === "aluno" ? abasAluno : abasProfessor;
  const mais = papel === "aluno" ? maisAluno(comPraticas) : [];
  const maisAtivo = mais.some((m) => caminho.startsWith(m.href));

  const estiloAba = (ativa: boolean) =>
    `flex min-w-0 flex-1 flex-col items-center gap-0.5 pt-2 pb-1.5 text-[11px] font-bold ${ativa ? "text-primaria" : "text-tinta-suave"}`;

  return (
    <div className="barra-inferior esconder-no-foco sm:hidden print:hidden">
      {aberto && (
        <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setAberto(false)} aria-hidden />
      )}
      {aberto && (
        <div
          role="dialog"
          aria-label="Mais opções"
          className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-50 max-h-[70vh] overflow-y-auto rounded-t-3xl border-t border-linha bg-fundo px-5 pt-3 pb-5 shadow-2xl"
        >
          <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-linha" aria-hidden />
          {mais.length > 0 && (
            <ul className="grid grid-cols-2 gap-2">
              {mais.map((m) => (
                <li key={m.href}>
                  <Link
                    href={m.href}
                    aria-current={caminho.startsWith(m.href) ? "page" : undefined}
                    className="block rounded-2xl border border-linha px-4 py-3 font-bold aria-[current]:border-primaria aria-[current]:bg-primaria-suave aria-[current]:text-primaria"
                  >
                    {m.rotulo}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 rounded-2xl bg-suave p-4">
            <PainelLeitura />
          </div>
          <div className="mt-4">
            <InstalarApp />
          </div>
          <form action={sair} className="mt-4">
            <button className="w-full rounded-full border-2 border-linha py-2.5 font-bold">Sair</button>
          </form>
        </div>
      )}
      <nav
        aria-label="Menu principal"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-linha bg-fundo/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
      >
        <ul className="mx-auto flex max-w-lg">
          {abas.map((a) => {
            const ativa = !aberto && abaAtiva(caminho, a.href);
            return (
              <li key={a.href} className="flex flex-1">
                <Link href={a.href} aria-current={ativa ? "page" : undefined} className={estiloAba(ativa)}>
                  {a.icone}
                  <span className="truncate">{a.rotulo}</span>
                </Link>
              </li>
            );
          })}
          <li className="flex flex-1">
            <button type="button" onClick={() => setAberto((v) => !v)} aria-expanded={aberto} className={estiloAba(aberto || maisAtivo)}>
              {icones.mais}
              <span>Mais</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
