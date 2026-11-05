"use client";

import { useActionState, useState } from "react";
import { Mensagem } from "@/components/ui/Mensagem";
import { botaoSecundario, campo, rotulo } from "@/components/ui/estilos";
import { excluirConta } from "./actions-excluir";

export function ExcluirConta({ professor }: { professor: boolean }) {
  const [aberto, setAberto] = useState(false);
  const [estado, acao, enviando] = useActionState(excluirConta, null);

  if (!aberto) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-tinta-suave">Apaga sua conta e tudo o que você criou na Repasa. Não dá para desfazer.</p>
        <button type="button" onClick={() => setAberto(true)} className={`${botaoSecundario} text-erro hover:border-erro`}>
          Excluir minha conta
        </button>
      </div>
    );
  }

  return (
    <form action={acao} className="space-y-4 rounded-2xl bg-erro-fundo p-4">
      <p className="text-sm text-tinta">
        <strong>Isso apaga para sempre</strong> seu perfil,{" "}
        {professor
          ? "suas turmas, atividades, aulas, página pública e as respostas dos alunos nas suas atividades"
          : "suas matérias, resumos, mapas, respostas, gravações e o progresso do modo foco"}
        . Se quiser guardar algo, exporte antes.
      </p>
      <div>
        <label htmlFor="confirmacao" className={rotulo}>
          Digite EXCLUIR para confirmar
        </label>
        <input id="confirmacao" name="confirmacao" autoComplete="off" required className={campo} />
      </div>
      <Mensagem estado={estado} />
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={enviando} className="rounded-full bg-erro px-5 py-2 text-sm font-bold text-white disabled:opacity-60">
          {enviando ? "Excluindo..." : "Excluir minha conta para sempre"}
        </button>
        <button type="button" onClick={() => setAberto(false)} className={botaoSecundario}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
