import Link from "next/link";
import { IconeLogo } from "@/components/Mascote";
import { sair } from "@/app/entrar/actions";
import { NavConta } from "@/app/aluno/NavConta";
import { iaConfigurada } from "@/lib/pratica/gerar";
import { obterPerfil, paginaInicial } from "@/lib/perfil";
import { PreferenciasLeitura } from "@/components/PreferenciasLeitura";
import { BarraInferior } from "@/components/BarraInferior";
import { MenuConta, MenuPrincipal } from "@/components/MenuTopo";
import { SincronizarTema } from "@/components/Tema";
import { urlDaFoto } from "@/lib/foto";
import { EscolherIdioma, SincronizarIdioma } from "@/components/EscolherIdioma";
import { ehIdiomaSite } from "@/i18n/config";
import { obterDicionario, obterIdioma } from "@/i18n/servidor";

/** semMenu: só a marca (ex.: na verificação em duas etapas, antes de liberar a conta). */
export async function Cabecalho({ semMenu = false }: { semMenu?: boolean } = {}) {
  const perfil = semMenu ? null : await obterPerfil();
  const [d, idioma] = await Promise.all([obterDicionario(), obterIdioma()]);
  const idiomaConta = ehIdiomaSite(perfil?.idioma) ? perfil.idioma : null;
  // Logado, o logo leva ao painel; sem login, à página inicial do site.
  const inicio = perfil ? (perfil.papel_escolhido ? paginaInicial(perfil.papel) : "/bem-vindo") : "/";

  return (
    <header className="border-b border-linha">
      {!semMenu && <SincronizarTema tema={perfil?.tema ?? null} />}
      {idiomaConta && idiomaConta !== idioma && <SincronizarIdioma idioma={idiomaConta} />}
      {/* Largura toda: logo à esquerda, abas no centro, leitura e conta à direita. */}
      <div className="flex items-center gap-4 px-4 py-3 sm:px-6 lg:px-10">
        <div className="flex flex-1 basis-0 items-center">
          <Link href={inicio} className="flex items-center gap-2.5" aria-label={perfil ? d.cabecalho.irParaPainel : d.cabecalho.paginaInicial}>
            <IconeLogo />
            <span className="text-[17px] font-extrabold tracking-tight">Repasa</span>
          </Link>
          {/* A Repasa acabou de abrir para o público: o selo avisa que ela ainda está mudando. */}
          <span
            className="ml-2 rounded-full bg-primaria-suave px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-primaria"
            title={d.cabecalho.betaDica}
          >
            {d.cabecalho.beta}
          </span>
        </div>
        {!semMenu && perfil && perfil.papel_escolhido && (
          <div className="hidden justify-center sm:flex">
            <MenuPrincipal papel={perfil.papel} comPraticas={iaConfigurada()} />
          </div>
        )}
        {!semMenu && (
          <div className="flex flex-1 basis-0 items-center justify-end gap-2 text-sm font-semibold text-tinta-suave">
            {/* Sem login o globo aparece também no celular: é a primeira coisa que um visitante de fora procura. */}
            <span className={`esconder-no-foco ${perfil?.papel_escolhido ? "hidden sm:block" : ""}`}>
              <EscolherIdioma />
            </span>
            <span className="esconder-no-foco hidden sm:block">
              <PreferenciasLeitura />
            </span>
            {perfil ? (
              perfil.papel_escolhido ? (
                <div className="hidden sm:block">
                  <MenuConta nome={perfil.nome} foto={urlDaFoto(perfil.foto)} professor={perfil.papel === "professor"} />
                </div>
              ) : (
                <form action={sair}>
                  <button className="rounded-full border-2 border-linha px-4 py-1 font-bold text-tinta hover:border-tinta">{d.menu.sair}</button>
                </form>
              )
            ) : (
              <nav className="esconder-no-foco flex items-center gap-3 sm:gap-4">
                <Link href="/cadastro" className="hidden hover:text-tinta sm:inline">
                  {d.cabecalho.criarConta}
                </Link>
                <Link href="/entrar" className="rounded-full bg-tinta px-4 py-1.5 font-bold text-fundo">
                  {d.cabecalho.entrar}
                </Link>
              </nav>
            )}
          </div>
        )}
      </div>
      {perfil?.papel === "aluno" && (
        <div className="so-no-foco mx-auto max-w-3xl px-4 pb-3 sm:hidden">
          <NavConta comPraticas={iaConfigurada()} className="" />
        </div>
      )}
      {perfil && perfil.papel_escolhido && <BarraInferior papel={perfil.papel} comPraticas={iaConfigurada()} foto={urlDaFoto(perfil.foto)} />}
    </header>
  );
}
