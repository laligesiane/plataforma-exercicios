import type { ReactNode } from "react";
import type { Dicionario } from "@/i18n/dicionarios/pt";

/** Itens do menu, compartilhados pela barra de baixo (celular) e pelo menu do topo (computador). */
export type ChaveMenu = keyof Dicionario["menu"];
/** chave: o texto do item no dicionário (d.menu[chave]), para o menu seguir o idioma escolhido. */
export type Item = { href: string; chave: ChaveMenu; icone: ReactNode };

const traco = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const Icone = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" className="size-6 shrink-0" aria-hidden {...traco}>
    {children}
  </svg>
);

export const icones = {
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
  materias: (
    <Icone>
      <path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z" />
      <path d="M4 21V5M18 19v2H6" />
    </Icone>
  ),
  mapas: (
    <Icone>
      <circle cx="12" cy="12" r="2.5" />
      <circle cx="4.5" cy="5.5" r="2" />
      <circle cx="19.5" cy="5.5" r="2" />
      <circle cx="4.5" cy="18.5" r="2" />
      <circle cx="19.5" cy="18.5" r="2" />
      <path d="m6 7 4.2 3.4M18 7l-4.2 3.4M6 17l4.2-3.4M18 17l-4.2-3.4" />
    </Icone>
  ),
  praticas: (
    <Icone>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
    </Icone>
  ),
  agenda: (
    <Icone>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </Icone>
  ),
  foco: (
    <Icone>
      <path d="M12 21v-8" />
      <path d="M12 14c-1-4-5-6-8-5 0 4 4 6 8 5zM12 12c1-4 5-6 8-5 0 4-4 6-8 5z" />
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
  site: (
    <Icone>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M7 6.5h.01M10 6.5h.01" />
      <path d="M7 13h6M7 16h4" />
    </Icone>
  ),
  sair: (
    <Icone>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H4" />
    </Icone>
  ),
  mais: (
    <Icone>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </Icone>
  ),
  seta: (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden {...traco}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
};

export const abasAluno: Item[] = [
  { href: "/aluno", chave: "inicio", icone: icones.inicio },
  { href: "/aluno/atividades", chave: "atividades", icone: icones.atividades },
  { href: "/aluno/cursos", chave: "cursos", icone: icones.materias },
  { href: "/aluno/agenda", chave: "agenda", icone: icones.agenda },
];

export const abasProfessor: Item[] = [
  { href: "/professor", chave: "turmas", icone: icones.turmas },
  { href: "/professor/atividades", chave: "atividades", icone: icones.atividades },
  { href: "/biblioteca", chave: "biblioteca", icone: icones.resumos },
  { href: "/perfil", chave: "perfil", icone: icones.perfil },
];

/**
 * O resto do menu do aluno, dentro do "Mais". Resumos e mapas mentais ficam dentro de cada
 * matéria (dentro dos cursos), e o Repasar fica dentro de Atividades, por isso não aparecem aqui.
 */
export const maisAluno = (comPraticas: boolean): Item[] => [
  ...(comPraticas ? ([{ href: "/aluno/praticas", chave: "praticas", icone: icones.praticas }] as Item[]) : []),
  { href: "/aluno/foco", chave: "modoFoco", icone: icones.foco },
];

/** Páginas que moram dentro de outra aba e devem acendê-la no menu. */
const dentroDe: Record<string, string[]> = {
  "/aluno/atividades": ["/aluno/revisar", "/aluno/turmas"],
  "/aluno/cursos": ["/aluno/materias", "/aluno/resumos", "/aluno/mapas"],
};

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
  if (href === "/aluno") return caminho === href;
  if (href === "/professor") return caminho === href || caminho.startsWith("/professor/turmas");
  return caminho.startsWith(href) || (dentroDe[href] ?? []).some((p) => caminho.startsWith(p));
}
