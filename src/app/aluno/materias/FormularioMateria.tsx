"use client";

import { useActionState, useState } from "react";
import { Mensagem } from "@/components/ui/Mensagem";
import { botaoPrimario, campo, rotulo } from "@/components/ui/estilos";
import { cores, ordemCores, type Cor } from "@/lib/mapas";
import { criarMateria } from "./actions";

export function FormularioMateria() {
  const [estado, acao, enviando] = useActionState(criarMateria, null);
  const [cor, setCor] = useState<Cor>("menta");

  return (
    <form action={acao} className="space-y-4">
      <input type="hidden" name="cor" value={cor} />
      <div>
        <label htmlFor="nome-materia" className={rotulo}>
          Nome da matéria
        </label>
        <input id="nome-materia" name="nome" required maxLength={80} placeholder="Ex.: Biologia" className={campo} />
      </div>
      <fieldset>
        <legend className={rotulo}>Cor</legend>
        <div className="flex gap-2">
          {ordemCores.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Cor ${cores[c].nome}`}
              aria-pressed={cor === c}
              onClick={() => setCor(c)}
              className={`size-7 rounded-full outline-offset-2 ${cor === c ? "outline-2 outline-tinta" : ""}`}
              style={{ background: cores[c].traco }}
            />
          ))}
        </div>
      </fieldset>
      <Mensagem estado={estado} />
      <button type="submit" disabled={enviando} className={botaoPrimario}>
        {enviando ? "Criando..." : "Criar matéria"}
      </button>
    </form>
  );
}
