"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const abas = [
  { href: "/aluno", rotulo: "Visão geral" },
  { href: "/aluno/atividades", rotulo: "Atividades" },
  { href: "/aluno/revisar", rotulo: "Repasar erros" },
  { href: "/aluno/materias", rotulo: "Matérias" },
  { href: "/aluno/resumos", rotulo: "Resumos" },
  { href: "/aluno/mapas", rotulo: "Mapas mentais" },
  { href: "/aluno/praticas", rotulo: "Práticas" },
  { href: "/aluno/agenda", rotulo: "Agenda" },
  { href: "/aluno/foco", rotulo: "Modo foco" },
];

/** Abas da área Minha conta do aluno. "Práticas" só aparece com a geração por IA ligada. */
export function NavConta({ comPraticas = false }: { comPraticas?: boolean }) {
  const caminho = usePathname();
  const ativa = (href: string) => (href === "/aluno" ? caminho === href : caminho.startsWith(href));

  return (
    <nav aria-label="Minha conta" className="-mx-4 mt-6 overflow-x-auto px-4">
      <ul className="flex w-max gap-2">
        {abas.filter((a) => comPraticas || a.href !== "/aluno/praticas").map((a) => (
          <li key={a.href}>
            <Link
              href={a.href}
              aria-current={ativa(a.href) ? "page" : undefined}
              className={`inline-block rounded-full px-4 py-1.5 text-sm font-bold whitespace-nowrap transition-colors ${
                ativa(a.href) ? "bg-tinta text-fundo" : "border border-linha text-tinta-suave hover:border-tinta hover:text-tinta"
              }`}
            >
              {a.rotulo}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
