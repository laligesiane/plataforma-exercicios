"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Mensagem } from "@/components/ui/Mensagem";
import { botaoPrimario, caixaMarcar, campo, rotulo } from "@/components/ui/estilos";
import { normalizarApelido } from "@/lib/paginaProfessor";
import { salvarPaginaProfessor } from "./actions-pagina";

export type PaginaSalva = { apelido: string; nome: string; bio: string; materias: string; contato: string; publicada: boolean };

export function FormularioPagina({ pagina, nomePadrao }: { pagina: PaginaSalva | null; nomePadrao: string }) {
  const [estado, acao, enviando] = useActionState(salvarPaginaProfessor, null);
  const [apelido, setApelido] = useState(pagina?.apelido ?? normalizarApelido(nomePadrao));

  return (
    <form action={acao} className="space-y-4">
      <div>
        <label htmlFor="apelido" className={rotulo}>
          Endereço da página
        </label>
        <div className="flex items-center gap-1">
          <span className="shrink-0 text-sm text-tinta-suave">repasa.com.br/p/</span>
          <input
            id="apelido"
            name="apelido"
            value={apelido}
            onChange={(e) => setApelido(e.target.value.toLowerCase())}
            onBlur={() => setApelido(normalizarApelido(apelido))}
            required
            minLength={3}
            maxLength={40}
            className={campo}
          />
        </div>
      </div>
      <div>
        <label htmlFor="pagina-nome" className={rotulo}>
          Nome na página
        </label>
        <input id="pagina-nome" name="nome" defaultValue={pagina?.nome ?? nomePadrao} required maxLength={80} className={campo} />
      </div>
      <div>
        <label htmlFor="materias" className={rotulo}>
          O que você ensina
        </label>
        <input id="materias" name="materias" defaultValue={pagina?.materias ?? ""} maxLength={200} placeholder="Ex.: Matemática para o ENEM, inglês para adultos" className={campo} />
      </div>
      <div>
        <label htmlFor="bio" className={rotulo}>
          Sobre você
        </label>
        <textarea id="bio" name="bio" defaultValue={pagina?.bio ?? ""} maxLength={1500} rows={5} placeholder="Sua formação, como são suas aulas, para quem elas servem…" className={campo} />
      </div>
      <div>
        <label htmlFor="contato" className={rotulo}>
          Contato
        </label>
        <input id="contato" name="contato" defaultValue={pagina?.contato ?? ""} maxLength={200} placeholder="E-mail, site (https://…) ou WhatsApp" className={campo} />
      </div>
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" name="publicada" defaultChecked={pagina?.publicada ?? false} className={caixaMarcar} />
        Deixar a página no ar
      </label>
      <Mensagem estado={estado} />
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={enviando} className={botaoPrimario}>
          {enviando ? "Salvando..." : "Salvar página"}
        </button>
        {pagina && (
          <Link href={`/p/${pagina.apelido}`} className="text-sm font-bold text-primaria hover:underline">
            Ver minha página
          </Link>
        )}
      </div>
    </form>
  );
}
