"use client";

import { useActionState, useState } from "react";
import { Mensagem } from "@/components/ui/Mensagem";
import { botaoPrimario, campo, rotulo } from "@/components/ui/estilos";
import { idiomaNaMateria, idiomas } from "@/lib/idiomas";
import { AvisoMateriaIdioma } from "./AvisoMateriaIdioma";
import { sugestoesMateria } from "@/lib/turmas";
import { criarTurma } from "./actions";

const opcoes = Object.entries(idiomas);

export function FormularioTurma() {
  const [estado, acao, enviando] = useActionState(criarTurma, null);
  const [tipo, setTipo] = useState<"idioma" | "materia">("materia");
  const [materia, setMateria] = useState("");
  const [ensinado, setEnsinado] = useState("");

  return (
    <form action={acao} className="space-y-4">
      <div>
        <label htmlFor="nome" className={rotulo}>
          Nome da turma
        </label>
        <input
          id="nome"
          name="nome"
          placeholder={tipo === "idioma" ? "Ex.: Espanhol A2 terça à noite" : "Ex.: Matemática 9º ano"}
          required
          className={campo}
        />
      </div>

      <fieldset>
        <legend className={rotulo}>O que você ensina nesta turma</legend>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["materia", "Uma matéria"],
              ["idioma", "Um idioma"],
            ] as const
          ).map(([valor, texto]) => (
            <label
              key={valor}
              className={`cursor-pointer rounded-full border-2 px-4 py-1.5 text-sm font-bold transition-colors ${tipo === valor ? "border-primaria bg-primaria-suave text-primaria" : "border-linha text-tinta-suave hover:border-tinta"}`}
            >
              <input
                type="radio"
                name="tipo"
                value={valor}
                checked={tipo === valor}
                onChange={() => setTipo(valor)}
                className="sr-only"
              />
              {texto}
            </label>
          ))}
        </div>
      </fieldset>

      {tipo === "idioma" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="idioma_ensinado" className={rotulo}>
              Idioma que você ensina
            </label>
            <select id="idioma_ensinado" name="idioma_ensinado" required value={ensinado} onChange={(e) => setEnsinado(e.target.value)} className={campo}>
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
      ) : (
        <div>
          <label htmlFor="materia" className={rotulo}>
            Matéria
          </label>
          <input
            id="materia"
            name="materia"
            required
            maxLength={80}
            list="sugestoes-materia"
            placeholder="Ex.: Matemática, Violão, Direito"
            value={materia}
            onChange={(e) => setMateria(e.target.value)}
            className={campo}
          />
          <AvisoMateriaIdioma
            idioma={idiomaNaMateria(materia)}
            onUsarIdioma={(codigo) => {
              setEnsinado(codigo);
              setTipo("idioma");
            }}
          />
          <datalist id="sugestoes-materia">
            {sugestoesMateria.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </div>
      )}

      <Mensagem estado={estado} />
      <button type="submit" disabled={enviando} className={botaoPrimario}>
        {enviando ? "Criando..." : "Criar turma"}
      </button>
    </form>
  );
}
