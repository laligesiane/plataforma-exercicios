"use client";

import { useDicionario } from "@/i18n/cliente";
import { CampoData } from "@/components/ui/CampoData";
import { useActionState, useEffect, useRef } from "react";
import { Mensagem } from "@/components/ui/Mensagem";
import {
  botaoPrimario,
  botaoSecundario,
  campo,
  rotulo,
} from "@/components/ui/estilos";
import { descreverDuracao } from "@/lib/cursos";
import { criarCurso, editarCurso } from "./actions";

export type CursoCompleto = {
  id: string;
  nome: string;
  inicio: string | null;
  duracao_meses: number | null;
  etapa: string | null;
};

/** Campos do curso: nome, quando começou, quanto dura e em que etapa está. Só o nome é obrigatório. */
function CamposCurso({
  prefixo,
  curso,
}: {
  prefixo: string;
  curso?: CursoCompleto;
}) {
  const d = useDicionario();
  const tx = d.cursos;
  const duracao = curso?.duracao_meses
    ? descreverDuracao(curso.duracao_meses)
    : null;
  return (
    <>
      <div>
        <label htmlFor={`${prefixo}-nome`} className={rotulo}>
          {tx.nomeCurso}
        </label>
        <input
          id={`${prefixo}-nome`}
          name="nome"
          required
          maxLength={80}
          defaultValue={curso?.nome}
          placeholder={tx.nomeCursoExemplo}
          className={campo}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${prefixo}-inicio`} className={rotulo}>
            {tx.quandoComecou}{" "}
            <span className="font-normal text-tinta-suave">{d.comum.opcional}</span>
          </label>
          <CampoData id={`${prefixo}-inicio`} name="inicio" defaultValue={curso?.inicio ?? ""} />
        </div>
        <div>
          <label htmlFor={`${prefixo}-duracao`} className={rotulo}>
            {tx.duracao}{" "}
            <span className="font-normal text-tinta-suave">{d.comum.opcional}</span>
          </label>
          <div className="flex gap-2">
            <div className="w-20 shrink-0">
              <input
                id={`${prefixo}-duracao`}
                name="duracao"
                inputMode="decimal"
                maxLength={4}
                defaultValue={duracao?.quantidade ?? ""}
                placeholder={tx.duracaoExemplo}
                className={campo}
              />
            </div>
            <label htmlFor={`${prefixo}-unidade`} className="sr-only">
              {tx.unidadeDuracao}
            </label>
            <div className="min-w-0 grow">
              <select
                id={`${prefixo}-unidade`}
                name="unidade"
                defaultValue={duracao?.unidade ?? "anos"}
                className={campo}
              >
                <option value="meses">{tx.unidades.meses}</option>
                <option value="semestres">{tx.unidades.semestres}</option>
                <option value="anos">{tx.unidades.anos}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <div>
        <label htmlFor={`${prefixo}-etapa`} className={rotulo}>
          {tx.ondeEsta}{" "}
          <span className="font-normal text-tinta-suave">{d.comum.opcional}</span>
        </label>
        <input
          id={`${prefixo}-etapa`}
          name="etapa"
          maxLength={60}
          defaultValue={curso?.etapa ?? ""}
          placeholder={tx.ondeEstaExemplo}
          className={campo}
        />
      </div>
      <p className="text-xs text-tinta-suave">
        {tx.calculaFim}
      </p>
    </>
  );
}

export function FormularioCurso() {
  const d = useDicionario();
  const [estado, acao, enviando] = useActionState(criarCurso, null);
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (estado?.sucesso) form.current?.reset();
  }, [estado]);

  return (
    <form ref={form} action={acao} className="space-y-4">
      <CamposCurso prefixo="novo-curso" />
      <Mensagem estado={estado} />
      <button type="submit" disabled={enviando} className={botaoPrimario}>
        {enviando ? d.comum.criando : d.cursos.criarCurso}
      </button>
    </form>
  );
}

export function FormularioEditarCurso({ curso }: { curso: CursoCompleto }) {
  const d = useDicionario();
  const [estado, acao, enviando] = useActionState(editarCurso, null);
  return (
    <form
      action={acao}
      className="mt-3 space-y-4 rounded-2xl border border-linha p-4"
    >
      <input type="hidden" name="id" value={curso.id} />
      <CamposCurso prefixo={`curso-${curso.id}`} curso={curso} />
      <Mensagem estado={estado} />
      <button type="submit" disabled={enviando} className={botaoSecundario}>
        {enviando ? d.comum.salvando : d.cursos.salvarCurso}
      </button>
    </form>
  );
}
