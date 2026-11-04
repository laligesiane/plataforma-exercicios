"use client";

import { useActionState } from "react";
import { Mensagem } from "@/components/ui/Mensagem";
import { botaoPrimario, botaoSecundario, campo, rotulo } from "@/components/ui/estilos";
import { desligarMfa, passoMfa, salvarNome, salvarSenha, type EstadoMfa } from "./actions";

export function FormularioNome({ nome }: { nome: string }) {
  const [estado, acao, enviando] = useActionState(salvarNome, null);
  return (
    <form action={acao} className="space-y-3">
      <label htmlFor="nome" className={rotulo}>
        Nome
      </label>
      <div className="flex gap-2">
        <input id="nome" name="nome" defaultValue={nome} required maxLength={80} autoComplete="name" className={campo} />
        <button type="submit" disabled={enviando} className={`${botaoSecundario} shrink-0`}>
          {enviando ? "Salvando..." : "Salvar"}
        </button>
      </div>
      <Mensagem estado={estado} />
    </form>
  );
}

export function FormularioSenhaPerfil() {
  const [estado, acao, enviando] = useActionState(salvarSenha, null);
  return (
    <form action={acao} className="space-y-3">
      <div>
        <label htmlFor="senha" className={rotulo}>
          Nova senha
        </label>
        <input id="senha" name="senha" type="password" minLength={8} required autoComplete="new-password" className={campo} />
      </div>
      <div>
        <label htmlFor="confirmacao" className={rotulo}>
          Repita a senha
        </label>
        <input id="confirmacao" name="confirmacao" type="password" minLength={8} required autoComplete="new-password" className={campo} />
      </div>
      <Mensagem estado={estado} />
      <button type="submit" disabled={enviando} className={botaoSecundario}>
        {enviando ? "Salvando..." : "Salvar senha"}
      </button>
    </form>
  );
}

export function AtivarMfa() {
  const [estado, acao, enviando] = useActionState<EstadoMfa, FormData>(passoMfa, { etapa: "inicio" });

  if (estado.etapa === "ligado") {
    return <Mensagem estado={{ sucesso: "Pronto! A partir de agora a Repasa pede o código do app quando você entrar." }} />;
  }

  if (estado.etapa === "inicio") {
    return (
      <form action={acao} className="space-y-3">
        <input type="hidden" name="passo" value="iniciar" />
        <Mensagem estado={estado.erro ? { erro: estado.erro } : null} />
        <button type="submit" disabled={enviando} className={botaoPrimario}>
          {enviando ? "Preparando..." : "Ativar verificação em duas etapas"}
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <ol className="list-decimal space-y-1 pl-5 text-sm text-tinta-suave">
        <li>Instale no celular um app autenticador (Google Authenticator, Microsoft Authenticator ou 1Password).</li>
        <li>No app, escolha adicionar conta e aponte a câmera para o código abaixo.</li>
        <li>Digite os 6 números que aparecerem no app.</li>
      </ol>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={estado.qr} alt="QR code para o app autenticador" className="size-44 rounded-xl border border-linha bg-white p-2" />
      <p className="text-sm text-tinta-suave">
        Não dá para ler o QR code? Digite esta chave no app:{" "}
        <code className="rounded bg-suave px-1.5 py-0.5 font-mono text-xs break-all text-tinta">{estado.chave}</code>
      </p>
      <form action={acao} className="space-y-3">
        <input type="hidden" name="passo" value="confirmar" />
        <label htmlFor="codigo-mfa" className={rotulo}>
          Código do app
        </label>
        <div className="flex gap-2">
          <input
            id="codigo-mfa"
            name="codigo"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={7}
            required
            placeholder="123456"
            className={`${campo} max-w-40 text-center text-xl font-bold tracking-[0.3em]`}
          />
          <button type="submit" disabled={enviando} className={botaoPrimario}>
            {enviando ? "Conferindo..." : "Confirmar"}
          </button>
        </div>
        <Mensagem estado={estado.erro ? { erro: estado.erro } : null} />
      </form>
    </div>
  );
}

export function BotaoDesligarMfa({ fatorId }: { fatorId: string }) {
  return (
    <form
      action={desligarMfa}
      onSubmit={(e) => {
        if (!confirm("Desligar a verificação em duas etapas? Sua conta fica protegida só pela senha ou pelo código por e-mail.")) e.preventDefault();
      }}
    >
      <input type="hidden" name="fator" value={fatorId} />
      <button type="submit" className={botaoSecundario}>
        Desligar
      </button>
    </form>
  );
}
