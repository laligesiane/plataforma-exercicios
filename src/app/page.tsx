import { AulaDemo } from "@/components/exercicios/AulaDemo";

const etiquetas = ["Espanhol", "A2", "Gramática"];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-linha">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-[10px] bg-primaria text-sm font-extrabold text-white">
              ¿?
            </span>
            <span className="text-[17px] font-extrabold tracking-tight">Plataforma de Exercícios</span>
          </div>
          <nav className="flex items-center gap-4 text-sm font-semibold text-tinta-suave">
            <span className="hidden sm:inline">Atividades</span>
            <span className="hidden sm:inline">Níveis</span>
            <span className="rounded-full bg-tinta px-4 py-1.5 font-bold text-fundo">Entrar</span>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-8 pb-16">
        <div className="flex flex-wrap gap-1.5">
          {etiquetas.map((etiqueta) => (
            <span
              key={etiqueta}
              className={`rounded-full px-3 py-1 text-xs font-bold ${etiqueta === "A2" ? "bg-tinta text-fundo" : "bg-suave text-tinta-suave"}`}
            >
              {etiqueta}
            </span>
          ))}
        </div>
        <h1 className="mt-3 text-3xl leading-tight font-extrabold tracking-tight text-balance sm:text-4xl">
          Hábitos no passado e preposições
        </h1>
        <p className="mt-3 max-w-prose text-tinta-suave">
          Responda cada item e veja na hora se acertou. Se errar, a explicação aparece logo abaixo. Experimente errar de
          propósito.
        </p>

        <div className="mt-8">
          <AulaDemo />
        </div>
      </main>

      <footer className="border-t border-linha py-6 text-center text-xs text-tinta-suave">Versão de teste</footer>
    </div>
  );
}
