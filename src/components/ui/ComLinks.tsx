import Link from "next/link";
import { Fragment } from "react";

/**
 * Texto traduzido com links no meio: "Aceito os {termos} e a {privacidade}." vira texto com
 * os dois links, na ordem que cada idioma pedir.
 */
export function ComLinks({ texto, links, novaAba = false }: { texto: string; links: Record<string, [href: string, rotulo: string]>; novaAba?: boolean }) {
  const partes = texto.split(/\{(\w+)\}/);
  return (
    <>
      {partes.map((p, i) => {
        const link = i % 2 === 1 ? links[p] : undefined;
        if (!link) return <Fragment key={i}>{i % 2 === 1 ? `{${p}}` : p}</Fragment>;
        return (
          <Link key={i} href={link[0]} target={novaAba ? "_blank" : undefined} className="font-bold text-primaria hover:underline">
            {link[1]}
          </Link>
        );
      })}
    </>
  );
}
