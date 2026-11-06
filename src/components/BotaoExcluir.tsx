"use client";

import { useDicionario } from "@/i18n/cliente";
import { useFormStatus } from "react-dom";
import { botaoSecundario } from "@/components/ui/estilos";

function Botao({ rotulo, discreto }: { rotulo: string; discreto?: boolean }) {
  const { pending } = useFormStatus();
  const d = useDicionario();
  return (
    <button
      type="submit"
      disabled={pending}
      className={
        discreto
          ? "text-sm font-bold text-erro underline-offset-4 hover:underline disabled:opacity-60"
          : `${botaoSecundario} hover:border-erro hover:text-erro`
      }
    >
      {pending ? d.comum.excluindo : rotulo}
    </button>
  );
}

/** Botão de excluir que pede confirmação antes de enviar. */
export function BotaoExcluir({
  acao,
  campos,
  rotulo,
  pergunta,
  discreto,
  className,
}: {
  acao: (formData: FormData) => void | Promise<void>;
  campos: Record<string, string>;
  rotulo?: string;
  pergunta: string;
  discreto?: boolean;
  className?: string;
}) {
  const d = useDicionario();
  return (
    <form
      action={acao}
      className={className}
      onSubmit={(e) => {
        if (!window.confirm(pergunta)) e.preventDefault();
      }}
    >
      {Object.entries(campos).map(([nome, valor]) => (
        <input key={nome} type="hidden" name={nome} value={valor} />
      ))}
      <Botao rotulo={rotulo ?? d.comum.excluir} discreto={discreto} />
    </form>
  );
}
