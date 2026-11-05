"use client";

import { CampoData } from "@/components/ui/CampoData";
import { useActionState, useEffect, useRef } from "react";
import { Mensagem } from "@/components/ui/Mensagem";
import { botaoPrimario, caixaMarcar, campo, rotulo } from "@/components/ui/estilos";
import { tiposCompromisso, type Compromisso } from "@/lib/compromissos";
import { salvarCompromisso } from "./actions";

/** Adicionar (sem `compromisso`) ou editar um item da agenda pessoal. */
export function FormularioCompromisso({ compromisso, hoje }: { compromisso?: Compromisso; hoje: string }) {
  const [estado, acao, salvando] = useActionState(salvarCompromisso, null);
  const form = useRef<HTMLFormElement>(null);
  const p = compromisso?.id ?? "novo";

  // Depois de adicionar, limpa o formulário para o próximo.
  useEffect(() => {
    if (!compromisso && estado?.sucesso) form.current?.reset();
  }, [estado, compromisso]);

  return (
    <form ref={form} action={acao} className="space-y-4">
      {compromisso && <input type="hidden" name="id" value={compromisso.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${p}-tipo`} className={rotulo}>
            O que é
          </label>
          <select id={`${p}-tipo`} name="tipo" defaultValue={compromisso?.tipo ?? "tarefa"} className={campo}>
            {tiposCompromisso.map((t) => (
              <option key={t.valor} value={t.valor}>
                {t.rotulo}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${p}-materia`} className={rotulo}>
            Matéria ou lugar <span className="font-normal text-tinta-suave">(opcional)</span>
          </label>
          <input
            id={`${p}-materia`}
            name="materia"
            maxLength={100}
            defaultValue={compromisso?.materia}
            placeholder="Ex.: Cálculo, faculdade"
            className={campo}
          />
        </div>
      </div>
      <div>
        <label htmlFor={`${p}-titulo`} className={rotulo}>
          Nome
        </label>
        <input
          id={`${p}-titulo`}
          name="titulo"
          required
          maxLength={200}
          defaultValue={compromisso?.titulo}
          placeholder="Ex.: Prova 1 no site da faculdade"
          className={campo}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${p}-data`} className={rotulo}>
            Dia ou prazo
          </label>
          <CampoData id={`${p}-data`} name="data" required defaultValue={compromisso?.data ?? hoje} />
        </div>
        <div>
          <label htmlFor={`${p}-hora`} className={rotulo}>
            Horário <span className="font-normal text-tinta-suave">(opcional)</span>
          </label>
          <input id={`${p}-hora`} type="time" name="hora" defaultValue={compromisso?.hora?.slice(0, 5) ?? ""} className={campo} />
        </div>
      </div>
      {compromisso && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex items-center gap-2.5 self-end pb-3 font-bold">
              <input type="checkbox" name="feito" defaultChecked={compromisso.feito} className={caixaMarcar} />
              Já fiz
            </label>
            <div>
              <label htmlFor={`${p}-nota`} className={rotulo}>
                Nota <span className="font-normal text-tinta-suave">(opcional)</span>
              </label>
              <input
                id={`${p}-nota`}
                name="nota"
                maxLength={20}
                defaultValue={compromisso.nota}
                placeholder="Ex.: 8,5"
                className={campo}
              />
            </div>
          </div>
          <div>
            <label htmlFor={`${p}-anotacao`} className={rotulo}>
              Anotação <span className="font-normal text-tinta-suave">(opcional)</span>
            </label>
            <textarea
              id={`${p}-anotacao`}
              name="anotacao"
              rows={3}
              maxLength={2000}
              defaultValue={compromisso.anotacao}
              placeholder="Ex.: caiu muito derivada, revisar a regra da cadeia."
              className={campo}
            />
          </div>
        </>
      )}
      <Mensagem estado={estado} />
      <button type="submit" disabled={salvando} className={botaoPrimario}>
        {salvando ? "Salvando..." : compromisso ? "Salvar" : "Adicionar"}
      </button>
    </form>
  );
}
