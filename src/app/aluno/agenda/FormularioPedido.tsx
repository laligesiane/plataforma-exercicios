"use client";

import { useDicionario } from "@/i18n/cliente";
import { CampoData } from "@/components/ui/CampoData";
import { useActionState } from "react";
import { Mensagem } from "@/components/ui/Mensagem";
import { botaoPrimario, campo, rotulo } from "@/components/ui/estilos";
import { pedirAula } from "./actions";

export function FormularioPedido({ turmas, hoje }: { turmas: { id: string; nome: string }[]; hoje: string }) {
  const [estado, acao, enviando] = useActionState(pedirAula, null);
  const d = useDicionario();
  const tx = d.agenda;

  return (
    <form action={acao} className="space-y-4">
      {turmas.length > 1 ? (
        <div>
          <label htmlFor="pedido-turma" className={rotulo}>
            {tx.turma}
          </label>
          <select id="pedido-turma" name="turma_id" required className={campo}>
            {turmas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <input type="hidden" name="turma_id" value={turmas[0]?.id ?? ""} />
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pedido-data" className={rotulo}>
            {tx.dia}
          </label>
          <CampoData id="pedido-data" name="data" required min={hoje} />
        </div>
        <div>
          <label htmlFor="pedido-hora" className={rotulo}>
            {tx.horario} <span className="font-normal text-tinta-suave">{d.comum.opcional}</span>
          </label>
          <input id="pedido-hora" type="time" name="hora" className={campo} />
        </div>
      </div>
      <div>
        <label htmlFor="pedido-mensagem" className={rotulo}>
          {tx.recado} <span className="font-normal text-tinta-suave">{d.comum.opcional}</span>
        </label>
        <textarea
          id="pedido-mensagem"
          name="mensagem"
          rows={3}
          maxLength={1000}
          placeholder={tx.recadoExemplo}
          className={campo}
        />
      </div>
      <Mensagem estado={estado} />
      <button type="submit" disabled={enviando} className={botaoPrimario}>
        {enviando ? d.comum.enviando : tx.pedirAula}
      </button>
    </form>
  );
}
