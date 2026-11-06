"use client";

import { useDicionario } from "@/i18n/cliente";
import { useState, useTransition } from "react";
import { moverMateria } from "./actions";

export type CursoSimples = { id: string; nome: string };

/** Escolhe em qual curso a matéria fica. Salva assim que muda. */
export function SeletorCurso({
  materiaId,
  cursoId,
  cursos,
  compacto,
}: {
  materiaId: string;
  cursoId: string | null;
  cursos: CursoSimples[];
  compacto?: boolean;
}) {
  const [valor, setValor] = useState(cursoId ?? "");
  const [erro, setErro] = useState("");
  const [salvando, iniciar] = useTransition();
  const d = useDicionario();

  function mudar(novo: string) {
    const anterior = valor;
    setValor(novo);
    setErro("");
    iniciar(async () => {
      const r = await moverMateria(materiaId, novo || null);
      if (r?.erro) {
        setValor(anterior);
        setErro(r.erro);
      }
    });
  }

  return (
    <div className={compacto ? "mt-1.5" : ""}>
      <label className={compacto ? "flex items-center gap-2 text-xs text-tinta-suave" : "flex flex-wrap items-center gap-2 text-sm font-bold"}>
        {compacto ? d.cursos.cursoDoisPontos : d.cursos.curso}
        <select
          value={valor}
          disabled={salvando}
          onChange={(e) => mudar(e.target.value)}
          className={`rounded-lg border-2 border-linha bg-suave outline-none focus:border-primaria disabled:opacity-60 ${
            compacto ? "min-w-0 grow px-2 py-1 text-xs" : "px-3 py-1.5 text-sm font-normal"
          }`}
        >
          <option value="">{d.cursos.semCurso}</option>
          {cursos.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
        {salvando && <span className="text-xs font-normal text-tinta-suave">{d.comum.salvando}</span>}
      </label>
      {erro && (
        <p role="alert" className="mt-1 text-xs text-erro">
          {erro}
        </p>
      )}
    </div>
  );
}
