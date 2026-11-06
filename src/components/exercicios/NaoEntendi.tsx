"use client";

import { useDicionario } from "@/i18n/cliente";
import { useState, useTransition } from "react";
import { botaoSecundario, botaoTexto, campo } from "@/components/ui/estilos";

export type DuvidaSalva = { id: number; texto: string; resposta: string | null; criada_em: string };
export type EnviarDuvida = (exercicioId: string, texto: string) => Promise<{ ok: true; duvida: DuvidaSalva } | { ok: false; erro: string }>;

/** "Não entendi": o aluno escreve a dúvida sobre o exercício e vê a resposta do professor aqui mesmo. */
export function NaoEntendi({ exercicioId, iniciais = [], onEnviar }: { exercicioId: string; iniciais?: DuvidaSalva[]; onEnviar: EnviarDuvida }) {
  const tx = useDicionario().exercicio;
  const [duvidas, setDuvidas] = useState(iniciais);
  const [aberto, setAberto] = useState(false);
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState("");
  const [pendente, iniciar] = useTransition();

  function enviar() {
    const limpo = texto.trim();
    if (!limpo) return setErro(tx.duvidaVazia);
    iniciar(async () => {
      const r = await onEnviar(exercicioId, limpo);
      if (!r.ok) return setErro(r.erro);
      setDuvidas((d) => [...d, r.duvida]);
      setTexto("");
      setErro("");
      setAberto(false);
    });
  }

  return (
    <div className="mt-4 border-t border-linha pt-3">
      {duvidas.map((d) => (
        <div key={d.id} className="mb-3 rounded-xl bg-suave px-3.5 py-2.5 text-sm">
          <p>
            <strong className="font-bold">{tx.suaDuvida}</strong> {d.texto}
          </p>
          {d.resposta ? (
            <p className="mt-1.5 border-l-2 border-primaria pl-2.5">
              <strong className="font-bold text-primaria">{tx.professor}</strong> {d.resposta}
            </p>
          ) : (
            <p className="mt-1 text-xs text-tinta-suave">{tx.duvidaEnviada}</p>
          )}
        </div>
      ))}
      {aberto ? (
        <div>
          <label htmlFor={`duvida-${exercicioId}`} className="text-sm font-bold">
            {tx.oQueNaoEntendeu}
          </label>
          <textarea
            id={`duvida-${exercicioId}`}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            maxLength={1000}
            rows={3}
            placeholder={tx.duvidaExemplo}
            className={`${campo} mt-1.5 text-sm`}
          />
          {erro && (
            <p role="alert" className="mt-1 text-sm text-erro">
              {erro}
            </p>
          )}
          <div className="mt-2 flex items-center gap-3">
            <button type="button" onClick={enviar} disabled={pendente} className={botaoSecundario}>
              {pendente ? tx.enviando : tx.enviarProfessor}
            </button>
            <button type="button" onClick={() => setAberto(false)} className={botaoTexto}>
              {tx.cancelar}
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setAberto(true)} className={botaoTexto}>
          ? {tx.naoEntendi}
        </button>
      )}
    </div>
  );
}
