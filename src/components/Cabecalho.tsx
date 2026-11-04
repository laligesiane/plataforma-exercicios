import Link from "next/link";
import { sair } from "@/app/entrar/actions";
import { obterPerfil, paginaInicial } from "@/lib/perfil";

export async function Cabecalho() {
  const perfil = await obterPerfil();

  return (
    <header className="border-b border-linha">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3.5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-[10px] bg-primaria text-sm font-extrabold text-white">
            ¿?
          </span>
          <span className="text-[17px] font-extrabold tracking-tight">Repasa</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm font-semibold text-tinta-suave">
          {perfil ? (
            <>
              {perfil.papel === "professor" ? (
                <>
                  <Link href="/professor" className="hover:text-tinta">
                    Turmas
                  </Link>
                  <Link href="/professor/atividades" className="hover:text-tinta">
                    Atividades
                  </Link>
                </>
              ) : (
                <Link href={paginaInicial(perfil.papel)} className="hover:text-tinta">
                  Minhas atividades
                </Link>
              )}
              <form action={sair}>
                <button className="rounded-full border-2 border-linha px-4 py-1 font-bold text-tinta hover:border-tinta">
                  Sair
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/cadastro" className="hidden hover:text-tinta sm:inline">
                Sou professor
              </Link>
              <Link href="/entrar" className="rounded-full bg-tinta px-4 py-1.5 font-bold text-fundo">
                Entrar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
