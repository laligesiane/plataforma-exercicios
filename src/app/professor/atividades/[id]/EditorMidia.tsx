"use client";

import { useId, useRef, useState } from "react";
import { MidiaExercicio } from "@/components/exercicios/MidiaExercicio";
import { botaoIcone, botaoSecundario, botaoTexto, campo, rotulo } from "@/components/ui/estilos";
import { enviarArquivo, type TipoArquivo } from "@/lib/atividades/enviarMidia";
import { useExemplos } from "./exemplos";
import { ehLinkDeArquivo, enderecoDoVideo, formatosAceitos, LIMITE_ARQUIVO_MB, tiposMidia, type Midia } from "@/lib/atividades/midia";

const campoPequeno = campo.replace("py-2.5", "py-2");

/** Botão que abre o seletor de arquivo e envia para o Storage. */
export function BotaoEnviar({
  tipo,
  texto,
  onEnviado,
  className = botaoSecundario,
}: {
  tipo: TipoArquivo;
  texto: string;
  onEnviado: (url: string) => void;
  className?: string;
}) {
  const entrada = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function aoEscolher(arquivo: File | undefined) {
    if (!arquivo) return;
    setErro(null);
    setEnviando(true);
    const resultado = await enviarArquivo(arquivo, tipo);
    setEnviando(false);
    if (entrada.current) entrada.current.value = "";
    if ("erro" in resultado) setErro(resultado.erro);
    else onEnviado(resultado.url);
  }

  return (
    <span className="inline-flex flex-col gap-1">
      <input
        ref={entrada}
        type="file"
        accept={formatosAceitos[tipo].join(",")}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => aoEscolher(e.target.files?.[0])}
      />
      <button type="button" disabled={enviando} onClick={() => entrada.current?.click()} className={className}>
        {enviando ? "Enviando…" : texto}
      </button>
      {erro && (
        <span role="alert" className="text-sm font-semibold text-erro">
          {erro}
        </span>
      )}
    </span>
  );
}

/** Imagem, áudio ou vídeo do topo do exercício (opcional). */
export function EditorMidia({ midia, onChange }: { midia?: Midia; onChange: (midia: Midia | undefined) => void }) {
  const ex = useExemplos();
  const id = useId();

  if (!midia) {
    return (
      <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
        <span className="font-bold text-tinta-suave">Mídia (opcional):</span>
        {(Object.keys(tiposMidia) as Midia["tipo"][]).map((tipo) => (
          <button key={tipo} type="button" onClick={() => onChange({ tipo, url: "" })} className={botaoSecundario}>
            + {tiposMidia[tipo]}
          </button>
        ))}
      </div>
    );
  }

  const linkValido = midia.tipo === "video" ? enderecoDoVideo(midia.url) !== null : ehLinkDeArquivo(midia.url);
  const aviso =
    midia.url.trim() && !linkValido
      ? midia.tipo === "video"
        ? "Cole um link do YouTube ou do Vimeo."
        : "O link precisa começar com https://."
      : null;

  return (
    <div className="mt-5 rounded-xl bg-suave p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="font-bold">{tiposMidia[midia.tipo]} do exercício</span>
        <button type="button" onClick={() => onChange(undefined)} aria-label="Remover mídia" className={botaoIcone}>
          ✕
        </button>
      </div>

      <div className="space-y-3">
        {midia.tipo !== "video" && (
          <div className="flex flex-wrap items-center gap-3">
            <BotaoEnviar
              tipo={midia.tipo}
              texto={midia.url ? `Trocar ${midia.tipo === "imagem" ? "imagem" : "áudio"}` : `Enviar ${midia.tipo === "imagem" ? "imagem" : "áudio"}`}
              onEnviado={(url) => onChange({ ...midia, url })}
            />
            <span className="text-sm text-tinta-suave">Até {LIMITE_ARQUIVO_MB} MB. Ou cole um link abaixo.</span>
          </div>
        )}

        <div>
          <label htmlFor={`${id}-url`} className={rotulo}>
            {midia.tipo === "video" ? "Link do vídeo (YouTube ou Vimeo)" : "Link"}
          </label>
          <input
            id={`${id}-url`}
            value={midia.url}
            onChange={(e) => onChange({ ...midia, url: e.target.value })}
            placeholder={midia.tipo === "video" ? "https://www.youtube.com/watch?v=…" : "https://…"}
            inputMode="url"
            className={`${campoPequeno} bg-fundo`}
          />
          {aviso && <p className="mt-1 text-sm font-semibold text-erro">{aviso}</p>}
        </div>

        <div>
          <label htmlFor={`${id}-legenda`} className={rotulo}>
            {midia.tipo === "imagem" ? "Descrição da imagem" : "Legenda"} <span className="font-normal text-tinta-suave">(opcional)</span>
          </label>
          <input
            id={`${id}-legenda`}
            value={midia.legenda ?? ""}
            onChange={(e) => onChange({ ...midia, legenda: e.target.value })}
            placeholder={midia.tipo === "imagem" ? ex.legendaImagem : ex.legenda}
            maxLength={300}
            className={`${campoPequeno} bg-fundo`}
          />
        </div>

        {linkValido && (
          <div className="rounded-xl bg-fundo p-3">
            <MidiaExercicio midia={{ ...midia, url: midia.url.trim() }} />
          </div>
        )}
      </div>
    </div>
  );
}

/** Imagem opcional de um cartão do classificar. */
export function ImagemDoCartao({ imagem, onChange }: { imagem?: string; onChange: (imagem: string | undefined) => void }) {
  if (!imagem) {
    return <BotaoEnviar tipo="imagem" texto="+ Imagem no cartão" onEnviado={onChange} className={botaoTexto} />;
  }
  return (
    <div className="flex items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element -- prévia da imagem enviada */}
      <img src={imagem} alt="" className="size-14 rounded-lg bg-suave object-cover" />
      <BotaoEnviar tipo="imagem" texto="Trocar" onEnviado={onChange} className={botaoTexto} />
      <button type="button" onClick={() => onChange(undefined)} className={botaoTexto}>
        Tirar imagem
      </button>
    </div>
  );
}
