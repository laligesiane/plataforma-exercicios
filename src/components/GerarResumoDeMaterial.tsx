"use client";

import { useRef, useState, useTransition } from "react";
import { Mascote } from "@/components/Mascote";
import { Icone } from "@/components/jogos/Icones";
import { botaoPrimario, campo } from "@/components/ui/estilos";
import { gerarResumoDeMaterial } from "@/app/resumos/actions";
import type { Documento } from "@/lib/documento";
import { TAMANHOS, type Tamanho } from "@/lib/resumo-ia/converter";
import { aceitos, LIMITE_MATERIAL } from "@/lib/resumo-ia/extrair";

type Props = {
  /** Recebe o resumo gerado para colocar no editor. Devolve false se a pessoa desistiu de trocar. */
  aoGerar: (titulo: string, conteudo: Documento) => boolean;
  /** Começa aberto (resumo novo e vazio). */
  aberto?: boolean;
};

const MB = 1024 * 1024;

/** Envia um PDF, slides ou texto e a IA escreve o resumo, que cai no editor para revisar antes de salvar. */
export function GerarResumoDeMaterial({ aoGerar, aberto = false }: Props) {
  const [modo, setModo] = useState<"arquivo" | "texto">("arquivo");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [texto, setTexto] = useState("");
  const [tamanho, setTamanho] = useState<Tamanho>("medio");
  const [etapa, setEtapa] = useState<"" | "lendo" | "escrevendo">("");
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [arrastando, setArrastando] = useState(false);
  const [, iniciar] = useTransition();
  const entrada = useRef<HTMLInputElement>(null);
  const ocupado = etapa !== "";

  function escolher(f: File | null | undefined) {
    setErro("");
    setAviso("");
    if (!f) return;
    if (f.size > 50 * MB) {
      setErro("Esse arquivo passa de 50 MB. Tente um arquivo menor.");
      return;
    }
    setArquivo(f);
  }

  function gerar() {
    setErro("");
    setAviso("");
    iniciar(async () => {
      try {
        let pedido: Parameters<typeof gerarResumoDeMaterial>[0];
        if (modo === "arquivo") {
          if (!arquivo) {
            setErro("Escolha um arquivo primeiro.");
            return;
          }
          setEtapa("lendo");
          const { materialDoArquivo } = await import("@/lib/resumo-ia/extrair");
          const material = await materialDoArquivo(arquivo);
          if (material.tipo === "erro") {
            setErro(material.erro);
            return;
          }
          pedido =
            material.tipo === "texto"
              ? { texto: material.texto, cortado: material.cortado, nomeArquivo: arquivo.name, tamanho }
              : { pdfBase64: material.base64, nomeArquivo: arquivo.name, tamanho };
          if (material.tipo === "texto" && material.cortado) {
            setAviso("O material é muito longo, então o resumo cobre só a primeira parte. Para o resto, envie outra parte depois.");
          }
        } else {
          pedido = { texto, tamanho, cortado: texto.length > LIMITE_MATERIAL };
        }
        setEtapa("escrevendo");
        const r = await gerarResumoDeMaterial(pedido);
        if (!r.ok) {
          setErro(r.erro);
          return;
        }
        if (aoGerar(r.titulo, r.conteudo)) {
          setAviso("Pronto! O resumo está no editor abaixo. Revise, ajuste o que quiser e salve.");
        }
      } catch {
        setErro("Não foi possível gerar agora. Confira sua internet e tente de novo.");
      } finally {
        setEtapa("");
      }
    });
  }

  const aba = (m: typeof modo, nome: string, icone: "arquivo" | "colar") => (
    <button
      type="button"
      role="tab"
      aria-selected={modo === m}
      onClick={() => setModo(m)}
      disabled={ocupado}
      className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-bold transition-colors ${
        modo === m ? "bg-primaria text-white" : "text-tinta-suave hover:bg-suave hover:text-tinta"
      }`}
    >
      <Icone nome={icone} className="size-4" />
      {nome}
    </button>
  );

  return (
    <details open={aberto} className="group rounded-2xl border-2 border-primaria/25 bg-primaria-suave p-5">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-lg font-bold">
        <Icone nome="brilho" className="size-5 text-primaria" />
        Gerar resumo de um PDF, slides ou texto
        <span aria-hidden className="ml-auto text-primaria transition-transform group-open:rotate-90">›</span>
      </summary>
      <p className="mt-1 text-sm text-tinta-suave">
        Envie o material da aula e a IA escreve um resumo organizado, com termos em negrito que viram cartões de estudo.
        Você revisa antes de salvar.
      </p>

      {ocupado && etapa === "escrevendo" ? (
        <div role="status" aria-live="polite" className="flex flex-col items-center gap-3 py-8 text-center">
          <Mascote pose="lendo" tamanho={96} animado />
          <p className="text-sm font-semibold text-tinta-suave">Escrevendo o resumo. Isso pode levar até um minuto.</p>
        </div>
      ) : (
        <>
          <div role="tablist" aria-label="De onde vem o material" className="mt-4 flex flex-wrap gap-1.5">
            {aba("arquivo", "Enviar arquivo", "arquivo")}
            {aba("texto", "Colar texto", "colar")}
          </div>

          {modo === "arquivo" ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setArrastando(true);
              }}
              onDragLeave={() => setArrastando(false)}
              onDrop={(e) => {
                e.preventDefault();
                setArrastando(false);
                escolher(e.dataTransfer.files?.[0]);
              }}
              className={`mt-3 flex flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
                arrastando ? "border-primaria bg-fundo" : "border-linha bg-fundo/60"
              }`}
            >
              <Icone nome={arquivo ? "arquivo" : "enviar"} className="size-7 text-primaria" />
              {arquivo ? (
                <p className="max-w-full truncate text-sm font-bold">{arquivo.name}</p>
              ) : (
                <p className="text-sm font-bold">Arraste o arquivo para cá</p>
              )}
              <button
                type="button"
                onClick={() => entrada.current?.click()}
                disabled={ocupado}
                className="text-sm font-bold text-primaria underline-offset-4 hover:underline"
              >
                {arquivo ? "Trocar arquivo" : "ou escolha no aparelho"}
              </button>
              <p className="text-xs text-tinta-suave">PDF, PowerPoint (.pptx), Word (.docx) ou .txt</p>
              <input
                ref={entrada}
                type="file"
                accept={aceitos}
                className="sr-only"
                tabIndex={-1}
                aria-label="Arquivo do material"
                onChange={(e) => {
                  escolher(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </div>
          ) : (
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={8}
              placeholder="Cole aqui o texto da apostila, do artigo ou das suas anotações."
              aria-label="Texto do material"
              className={`${campo} mt-3 resize-y`}
            />
          )}

          <fieldset className="mt-4">
            <legend className="mb-1.5 text-sm font-bold">Tamanho do resumo</legend>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(TAMANHOS) as [Tamanho, (typeof TAMANHOS)[Tamanho]][]).map(([t, info]) => (
                <label
                  key={t}
                  className={`cursor-pointer rounded-xl border-2 px-3.5 py-2 text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primaria ${
                    tamanho === t ? "border-primaria bg-fundo" : "border-linha hover:border-tinta-suave"
                  }`}
                >
                  <input type="radio" name="tamanho_ia" value={t} checked={tamanho === t} onChange={() => setTamanho(t)} className="sr-only" />
                  <span className="block font-bold">{info.nome}</span>
                  <span className="block text-xs text-tinta-suave">{info.dica}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button type="button" onClick={gerar} disabled={ocupado} className={`${botaoPrimario} flex items-center gap-2`}>
              <Icone nome="brilho" className="size-4" />
              {etapa === "lendo" ? "Lendo o arquivo..." : "Gerar resumo"}
            </button>
            <p className="text-xs text-tinta-suave">O texto do material é enviado para a IA só quando você clica.</p>
          </div>
        </>
      )}

      {erro && (
        <p role="alert" className="mt-4 rounded-xl bg-erro-fundo px-3.5 py-2.5 text-sm font-semibold text-erro">
          {erro}
        </p>
      )}
      {aviso && !erro && (
        <p role="status" className="mt-4 rounded-xl bg-fundo px-3.5 py-2.5 text-sm font-semibold text-primaria">
          {aviso}
        </p>
      )}
    </details>
  );
}
