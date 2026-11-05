"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Icone } from "@/components/jogos/Icones";
import { botaoPrimario, campo, rotulo } from "@/components/ui/estilos";
import { QUANTIDADES_SEM_IA, tiposSemIa, type TipoSemIa } from "@/lib/pratica/semIa";
import { criarAtividadeDosResumos } from "./actions";

type Opcao = { id: string; nome: string };

type Props = {
  resumos: (Opcao & { origem: string })[];
  materias: (Opcao & { resumos: number })[];
  cursos: Opcao[];
};

/** "Criar atividade": o aluno escolhe um resumo, uma matéria ou um curso, os tipos de pergunta e quantas. */
export function GerarAtividade({ resumos, materias, cursos }: Props) {
  const [estado, acao, criando] = useActionState(criarAtividadeDosResumos, null);
  const [tipos, setTipos] = useState<TipoSemIa[]>(["quiz", "verdadeiro-falso"]);
  const [quantidade, setQuantidade] = useState<number>(5);
  const [fonte, setFonte] = useState("");
  const comResumo = materias.filter((m) => m.resumos > 0);

  return (
    <section aria-labelledby="titulo-gerar" className="mt-6 rounded-2xl border border-linha p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primaria-suave text-primaria">
          <Icone nome="brilho" className="size-6" />
        </span>
        <div>
          <h2 id="titulo-gerar" className="text-lg font-bold">
            Criar atividade com seus resumos
          </h2>
          <p className="mt-0.5 text-sm text-tinta-suave">
            As perguntas saem dos títulos e dos trechos em negrito. Errou? A correção explica o porquê.
          </p>
        </div>
      </div>

      {resumos.length === 0 ? (
        <p className="mt-4 text-sm text-tinta-suave">
          Você ainda não tem resumos.{" "}
          <Link href="/aluno/materias" className="font-bold text-primaria hover:underline">
            Escrever o primeiro
          </Link>
        </p>
      ) : (
        <form action={acao} className="mt-5">
          <label htmlFor="fonte" className={rotulo}>
            De onde vêm as perguntas?
          </label>
          <select id="fonte" name="fonte" required value={fonte} onChange={(e) => setFonte(e.target.value)} className={campo}>
            <option value="" disabled>
              Escolha um resumo, uma matéria ou um curso
            </option>
            {cursos.length > 0 && (
              <optgroup label="Curso inteiro">
                {cursos.map((c) => (
                  <option key={c.id} value={`curso:${c.id}`}>
                    {c.nome}
                  </option>
                ))}
              </optgroup>
            )}
            {comResumo.length > 0 && (
              <optgroup label="Matéria inteira">
                {comResumo.map((m) => (
                  <option key={m.id} value={`materia:${m.id}`}>
                    {m.nome} ({m.resumos} {m.resumos === 1 ? "resumo" : "resumos"})
                  </option>
                ))}
              </optgroup>
            )}
            <optgroup label="Um resumo">
              {resumos.map((r) => (
                <option key={r.id} value={`resumo:${r.id}`}>
                  {r.origem ? `${r.nome} · ${r.origem}` : r.nome}
                </option>
              ))}
            </optgroup>
          </select>

          <fieldset className="mt-5">
            <legend className={rotulo}>Tipos de pergunta</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {(Object.entries(tiposSemIa) as [TipoSemIa, (typeof tiposSemIa)[TipoSemIa]][]).map(([tipo, info]) => {
                const marcado = tipos.includes(tipo);
                return (
                  <label
                    key={tipo}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primaria ${
                      marcado ? "border-primaria bg-primaria-suave" : "border-linha hover:border-tinta"
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="tipo"
                      value={tipo}
                      checked={marcado}
                      onChange={() => setTipos((t) => (marcado ? t.filter((x) => x !== tipo) : [...t, tipo]))}
                      className="sr-only"
                    />
                    <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${marcado ? "bg-primaria text-white" : "bg-suave text-tinta-suave"}`}>
                      <Icone nome={tipo} className="size-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold">{info.nome}</span>
                      <span className="block text-xs text-tinta-suave">{info.descricao}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="mt-5">
            <legend className={rotulo}>Perguntas de cada tipo</legend>
            <div className="flex gap-2">
              {QUANTIDADES_SEM_IA.map((q) => (
                <label
                  key={q}
                  className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-bold has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primaria ${
                    quantidade === q ? "bg-tinta text-fundo" : "border border-linha text-tinta-suave hover:border-tinta"
                  }`}
                >
                  <input
                    type="radio"
                    name="quantidade"
                    value={q}
                    checked={quantidade === q}
                    onChange={() => setQuantidade(q)}
                    className="sr-only"
                  />
                  {q}
                </label>
              ))}
            </div>
          </fieldset>

          {estado?.erro && (
            <p role="alert" className="mt-4 rounded-xl bg-erro-fundo px-3.5 py-2.5 text-sm font-semibold text-erro">
              {estado.erro}
            </p>
          )}

          <button type="submit" disabled={criando || tipos.length === 0} className={`${botaoPrimario} mt-5`}>
            {criando ? "Criando…" : "Criar atividade"}
          </button>
        </form>
      )}
    </section>
  );
}
