"use client";

import { useActionState } from "react";
import { Mensagem } from "@/components/ui/Mensagem";
import { botaoPrimario, campo, rotulo } from "@/components/ui/estilos";
import { idiomas } from "@/lib/idiomas";
import { criarTurma } from "./actions";

const opcoes = Object.entries(idiomas);

export function FormularioTurma() {
  const [estado, acao, enviando] = useActionState(criarTurma, null);

  return (
    <form action={acao} className="space-y-4">
      <div>
        <label htmlFor="nome" className={rotulo}>
          Nome da turma
        </label>
        <input id="nome" name="nome" placeholder="Ex.: Espanhol A2 terça à noite" required className={campo} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="idioma_ensinado" className={rotulo}>
            Idioma que você ensina
          </label>
          <select id="idioma_ensinado" name="idioma_ensinado" required defaultValue="" className={campo}>
            <option value="" disabled>
              Escolha
            </option>
            {opcoes.map(([codigo, nome]) => (
              <option key={codigo} value={codigo}>
                {nome}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="idioma_instrucao" className={rotulo}>
            Idioma das explicações
          </label>
          <select id="idioma_instrucao" name="idioma_instrucao" required defaultValue="" className={campo}>
            <option value="" disabled>
              Escolha
            </option>
            {opcoes.map(([codigo, nome]) => (
              <option key={codigo} value={codigo}>
                {nome}
              </option>
            ))}
          </select>
        </div>
      </div>
      <Mensagem estado={estado} />
      <button type="submit" disabled={enviando} className={botaoPrimario}>
        {enviando ? "Criando..." : "Criar turma"}
      </button>
    </form>
  );
}
