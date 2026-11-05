"use client";

import { useEffect, useState } from "react";
import { Mascote } from "@/components/Mascote";
import { botaoPrimario, botaoSecundario } from "@/components/ui/estilos";
import { CHAVE_RECARREGOU, ehErroDeVersao, podeRecarregar } from "@/lib/erros";

/**
 * O que aparece no lugar do "Application error" quando algo quebra numa página.
 * Se o erro for de versão antiga do site (página aberta durante uma atualização), recarrega sozinha.
 * Mostra um detalhe curto do erro para ajudar a achar a causa.
 */
export function TelaDeErro({ erro, tentarDeNovo }: { erro: Error & { digest?: string }; tentarDeNovo?: () => void }) {
  const versao = ehErroDeVersao(erro);
  const [recarregando, setRecarregando] = useState(false);

  useEffect(() => {
    console.error(erro);
    if (!versao) return;
    try {
      if (!podeRecarregar(sessionStorage.getItem(CHAVE_RECARREGOU), Date.now())) return;
      sessionStorage.setItem(CHAVE_RECARREGOU, String(Date.now()));
    } catch {
      /* sem armazenamento: recarrega mesmo assim */
    }
    setRecarregando(true);
    window.location.reload();
  }, [erro, versao]);

  const detalhe = erro.digest ? `Código ${erro.digest}` : [erro.name, erro.message].filter(Boolean).join(": ");

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-12 text-center">
      <Mascote tamanho={96} />
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight">
        {recarregando ? "Atualizando a Repasa…" : "Ops, esta página não abriu"}
      </h1>
      <p className="mt-2 text-tinta-suave">
        {recarregando
          ? "Saiu uma versão nova do site. Só um instante."
          : "Tente de novo. Se continuar, recarregue a página ou volte para o início."}
      </p>
      {!recarregando && (
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" className={botaoPrimario} onClick={() => (tentarDeNovo ? tentarDeNovo() : window.location.reload())}>
            Tentar de novo
          </button>
          {/* Link comum de propósito: recarrega o site inteiro, que é o que resolve depois de um erro. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" className={botaoSecundario}>
            Ir para o início
          </a>
        </div>
      )}
      {!recarregando && detalhe && (
        <p className="mt-8 max-w-full text-xs break-words text-tinta-suave/80">Detalhe para o suporte: {detalhe}</p>
      )}
    </main>
  );
}
