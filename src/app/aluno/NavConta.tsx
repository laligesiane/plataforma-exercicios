"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { abaAtiva } from "@/components/navegacao";

const abas = [
  { href: "/aluno", rotulo: "Visão geral" },
  { href: "/aluno/atividades", rotulo: "Atividades" },
  { href: "/aluno/cursos", rotulo: "Cursos" },
  { href: "/aluno/praticas", rotulo: "Práticas" },
  { href: "/aluno/agenda", rotulo: "Agenda" },
  { href: "/aluno/foco", rotulo: "Modo foco" },
];

/** Abas do aluno no modo foco do celular (fora do foco, o menu fica na barra de baixo). "Práticas" só aparece com a geração por IA ligada. */
export function NavConta({ comPraticas = false, className = "mt-6" }: { comPraticas?: boolean; className?: string }) {
  const caminho = usePathname();
  const ativa = (href: string) => abaAtiva(caminho, href);

  return (
    <nav aria-label="Minha conta" className={`sem-rolagem -mx-4 overflow-x-auto px-4 ${className}`}>
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
