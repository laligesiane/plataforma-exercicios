"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { sair } from "@/app/entrar/actions";
import { PainelLeitura } from "@/components/PreferenciasLeitura";
import { InstalarApp } from "@/components/InstalarApp";
import { Avatar } from "@/components/Avatar";
import { PainelIdioma } from "@/components/EscolherIdioma";
import { useDicionario } from "@/i18n/cliente";
import { abaAtiva, abasAluno, abasProfessor, icones, maisAluno, semBarra, type Item } from "@/components/navegacao";

/** Barra de abas presa embaixo, só no celular. "Mais" abre uma folha com o resto do menu, a leitura e o Sair. */
export function BarraInferior({ papel, comPraticas = false, foto = null }: { papel: "aluno" | "professor"; comPraticas?: boolean; foto?: string | null }) {
  const caminho = usePathname();
  const d = useDicionario();
  const [aberto, setAberto] = useState(false);

  useEffect(() => setAberto(false), [caminho]);
  useEffect(() => {
    if (!aberto) return;
    const fechar = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    window.addEventListener("keydown", fechar);
    return () => window.removeEventListener("keydown", fechar);
  }, [aberto]);

  if (semBarra(caminho)) return null;

  // Com foto, o item "Perfil" mostra a foto no lugar do ícone.
  const iconePerfil = foto ? <Avatar foto={foto} className="size-6" /> : icones.perfil;
  const comFoto = (itens: Item[]) => itens.map((i) => (i.href === "/perfil" ? { ...i, icone: iconePerfil } : i));
  const abas = papel === "aluno" ? abasAluno : comFoto(abasProfessor);
  const mais: Item[] =
    papel === "aluno"
      ? [...maisAluno(comPraticas), { href: "/perfil", chave: "perfil", icone: iconePerfil }]
      : [{ href: "/professor/site", chave: "siteProfessor", icone: icones.site }];
  const maisAtivo = mais.some((m) => abaAtiva(caminho, m.href));

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
          aria-label={d.menu.maisOpcoes}
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
                    className="flex items-center gap-2.5 rounded-2xl border border-linha px-4 py-3 font-bold aria-[current]:border-primaria aria-[current]:bg-primaria-suave aria-[current]:text-primaria"
                  >
                    <span className="text-primaria">{m.icone}</span>
                    {d.menu[m.chave]}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 rounded-2xl bg-suave p-4">
            <PainelLeitura />
          </div>
          <div className="mt-4 rounded-2xl bg-suave p-4">
            <PainelIdioma />
          </div>
          <div className="mt-4">
            <InstalarApp />
          </div>
          <form action={sair} className="mt-4">
            <button className="w-full rounded-full border-2 border-linha py-2.5 font-bold">{d.menu.sair}</button>
          </form>
        </div>
      )}
      <nav
        aria-label={d.menu.principal}
        className="fixed inset-x-0 bottom-0 z-50 border-t border-linha bg-fundo/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
      >
        <ul className="mx-auto flex max-w-lg">
          {abas.map((a) => {
            const ativa = !aberto && abaAtiva(caminho, a.href);
            return (
              <li key={a.href} className="flex flex-1">
                <Link href={a.href} aria-current={ativa ? "page" : undefined} className={estiloAba(ativa)}>
                  {a.icone}
                  <span className="truncate">{d.menu[a.chave]}</span>
                </Link>
              </li>
            );
          })}
          <li className="flex flex-1">
            <button type="button" onClick={() => setAberto((v) => !v)} aria-expanded={aberto} className={estiloAba(aberto || maisAtivo)}>
              {icones.mais}
              <span>{d.menu.mais}</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
