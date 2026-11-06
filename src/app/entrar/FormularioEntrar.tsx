"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Mensagem } from "@/components/ui/Mensagem";
import { botaoPrimario, botaoTexto, campo, rotulo } from "@/components/ui/estilos";
import { useDicionario } from "@/i18n/cliente";
import { entrar, enviarCodigo, verificarCodigo, type EstadoCodigo } from "./actions";

type Modo = "senha" | "codigo";

export function FormularioEntrar({ proximo }: { proximo?: string }) {
  const [modo, setModo] = useState<Modo>("senha");
  const [email, setEmail] = useState("");
  const d = useDicionario();

  return (
    <div>
      <div role="tablist" aria-label={d.entrar.comoEntrar} className="mb-5 grid grid-cols-2 gap-1 rounded-full bg-suave p-1">
        {(
          [
            ["senha", d.entrar.comSenha],
            ["codigo", d.entrar.codigoEmail],
          ] as const
        ).map(([valor, texto]) => (
          <button
            key={valor}
            type="button"
            role="tab"
            aria-selected={modo === valor}
            onClick={() => setModo(valor)}
            className={`rounded-full px-3 py-2 text-sm font-bold transition-colors ${modo === valor ? "bg-fundo text-tinta shadow-sm" : "text-tinta-suave hover:text-tinta"}`}
          >
            {texto}
          </button>
        ))}
      </div>
      {modo === "senha" ? (
        <EntrarComSenha proximo={proximo} email={email} setEmail={setEmail} />
      ) : (
        <EntrarComCodigo proximo={proximo} email={email} setEmail={setEmail} />
      )}
    </div>
  );
}

type Props = { proximo?: string; email: string; setEmail: (v: string) => void };

function CampoEmail({ email, setEmail }: Pick<Props, "email" | "setEmail">) {
  const d = useDicionario();
  return (
    <div>
      <label htmlFor="email" className={rotulo}>
        {d.auth.email}
      </label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={campo}
      />
    </div>
  );
}

function EntrarComSenha({ proximo, email, setEmail }: Props) {
  const [estado, acao, enviando] = useActionState(entrar, null);
  const d = useDicionario();

  return (
    <form action={acao} className="space-y-4">
      {proximo && <input type="hidden" name="proximo" value={proximo} />}
      <CampoEmail email={email} setEmail={setEmail} />
      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor="senha" className={rotulo}>
            {d.auth.senha}
          </label>
          <Link href="/esqueci-senha" className="text-sm font-bold text-primaria hover:underline">
            {d.entrar.esqueci}
          </Link>
        </div>
        <input id="senha" name="senha" type="password" autoComplete="current-password" required className={campo} />
      </div>
      <Mensagem estado={estado} />
      <button type="submit" disabled={enviando} className={`${botaoPrimario} w-full`}>
        {enviando ? d.entrar.entrando : d.entrar.botao}
      </button>
    </form>
  );
}

function EntrarComCodigo({ proximo, email, setEmail }: Props) {
  const [envio, pedir, pedindo] = useActionState<EstadoCodigo, FormData>(enviarCodigo, null);
  const [conferencia, conferir, conferindo] = useActionState<EstadoCodigo, FormData>(verificarCodigo, null);
  const [trocouEmail, setTrocouEmail] = useState(false);
  const d = useDicionario();
  const enviadoPara = trocouEmail ? null : envio?.enviadoPara;

  if (!enviadoPara) {
    return (
      <form action={(f) => { setTrocouEmail(false); pedir(f); }} className="space-y-4">
        <p className="text-sm text-tinta-suave">{d.entrar.semSenha}</p>
        <CampoEmail email={email} setEmail={setEmail} />
        <Mensagem estado={envio} />
        <button type="submit" disabled={pedindo} className={`${botaoPrimario} w-full`}>
          {pedindo ? d.entrar.enviando : d.entrar.receberCodigo}
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <form action={conferir} className="space-y-4">
        {proximo && <input type="hidden" name="proximo" value={proximo} />}
        <input type="hidden" name="email" value={enviadoPara} />
        <Mensagem estado={conferencia?.erro ? conferencia : envio} />
        <div>
          <label htmlFor="codigo" className={rotulo}>
            {d.entrar.codigo}
          </label>
          <input
            id="codigo"
            name="codigo"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9 ]*"
            maxLength={12}
            required
            autoFocus
            placeholder="123456"
            className={`${campo} text-center text-2xl font-bold tracking-[0.4em]`}
          />
        </div>
        <button type="submit" disabled={conferindo} className={`${botaoPrimario} w-full`}>
          {conferindo ? d.entrar.conferindo : d.entrar.botao}
        </button>
      </form>
      <div className="flex justify-between gap-4">
        <button type="button" className={botaoTexto} onClick={() => setTrocouEmail(true)}>
          {d.entrar.outroEmail}
        </button>
        <form action={pedir}>
          <input type="hidden" name="email" value={enviadoPara} />
          <button type="submit" disabled={pedindo} className={botaoTexto}>
            {pedindo ? d.entrar.enviando : d.entrar.mandarDeNovo}
          </button>
        </form>
      </div>
    </div>
  );
}
