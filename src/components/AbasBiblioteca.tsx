import Link from "next/link";

/** Troca entre a Biblioteca de atividades e a de resumos. */
export function AbasBiblioteca({ atual }: { atual: "atividades" | "resumos" }) {
  const abas = [
    { chave: "atividades", rotulo: "Atividades", href: "/biblioteca" },
    { chave: "resumos", rotulo: "Resumos", href: "/biblioteca/resumos" },
  ] as const;
  return (
    <nav aria-label="Biblioteca" className="mb-6 flex gap-1 rounded-full bg-suave p-1 text-sm font-bold sm:w-fit">
      {abas.map((a) => (
        <Link
          key={a.chave}
          href={a.href}
          aria-current={atual === a.chave ? "page" : undefined}
          className={`flex-1 rounded-full px-4 py-1.5 text-center sm:flex-none ${atual === a.chave ? "bg-fundo text-primaria shadow-sm" : "text-tinta-suave hover:text-primaria"}`}
        >
          {a.rotulo}
        </Link>
      ))}
    </nav>
  );
}
