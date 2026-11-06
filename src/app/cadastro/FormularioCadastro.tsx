"use client";

import { useActionState, useEffect } from "react";
import { registrarEvento } from "@/lib/analytics/cliente";
import { Mensagem } from "@/components/ui/Mensagem";
import { botaoPrimario, caixaMarcar, campo, rotulo } from "@/components/ui/estilos";
import { ComLinks } from "@/components/ui/ComLinks";
import { useDicionario } from "@/i18n/cliente";
import { IDIOMAS, LANG_HTML, NOME_NATIVO, type IdiomaSite } from "@/i18n/config";
import { cadastrar } from "./actions";

export function FormularioCadastro({ papel, idioma }: { papel: "professor" | "aluno"; idioma: IdiomaSite }) {
  const [estado, acao, enviando] = useActionState(cadastrar, null);
  const d = useDicionario();

  useEffect(() => {
    if (estado?.sucesso) registrarEvento("sign_up", { method: "email", papel });
  }, [estado, papel]);

  if (estado?.sucesso) return <Mensagem estado={estado} />;

  return (
    <form action={acao} className="space-y-4">
      <input type="hidden" name="papel" value={papel} />
      <div>
        <label htmlFor="nome" className={rotulo}>
          {d.cadastro.seuNome}
        </label>
        <input id="nome" name="nome" autoComplete="name" required className={campo} />
      </div>
      <div>
        <label htmlFor="email" className={rotulo}>
          {d.auth.email}
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required className={campo} />
      </div>
      <div>
        <label htmlFor="senha" className={rotulo}>
          {d.auth.senha}
        </label>
        <input id="senha" name="senha" type="password" autoComplete="new-password" minLength={8} required className={campo} />
      </div>
      <div>
        <label htmlFor="idioma" className={rotulo}>
          {d.cadastro.seuIdioma}
        </label>
        <select id="idioma" name="idioma" defaultValue={idioma} className={campo}>
          {IDIOMAS.map((i) => (
            <option key={i} value={i} lang={LANG_HTML[i]}>
              {NOME_NATIVO[i]}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-tinta-suave">{d.cadastro.seuIdiomaAjuda}</p>
      </div>
      <label className="flex items-start gap-2.5 text-sm text-tinta-suave">
        <input type="checkbox" name="aceite" required className={`${caixaMarcar} mt-0.5`} />
        <span>
          <ComLinks
            novaAba
            texto={d.cadastro.aceite}
            links={{ termos: ["/termos", d.cadastro.termosUso], privacidade: ["/privacidade", d.auth.privacidade] }}
          />
        </span>
      </label>
      <Mensagem estado={estado} />
      <button type="submit" disabled={enviando} className={`${botaoPrimario} w-full`}>
        {enviando ? d.cadastro.criando : d.cadastro.botao}
      </button>
    </form>
  );
}
