"use client";

import { fmt } from "@/i18n/config";
import { useDicionario } from "@/i18n/cliente";
import { useEffect, useId, useRef, useState } from "react";
import { botaoPrimario, botaoSecundario, campo } from "@/components/ui/estilos";
import type { ItemProducao as Item } from "@/lib/atividades/modelo";

export type Correcao = {
  avaliacao: "muito_bem" | "refazer";
  comentario: string;
  /** O aluno mandou uma versão nova depois desta correção. */
  anterior: boolean;
};

export type ProducaoSalva = {
  texto: string;
  /** Link temporário para ouvir o áudio enviado. */
  audioUrl: string | null;
  enviadaEm: string;
  correcao: Correcao | null;
};

export type DadosProducao = { texto: string } | { audio: Blob };

export type EnviarProducao = (
  exercicioId: string,
  itemId: string,
  dados: DadosProducao,
) => Promise<{ ok: true; salva: ProducaoSalva } | { ok: false; erro: string }>;

const MAX_GRAVACAO_S = 5 * 60;

/** Produção escrita ou oral: o aluno envia e o professor corrige depois. */
export function ItemProducao({
  item,
  salva: salvaInicial,
  onEnviar,
}: {
  item: Item;
  salva?: ProducaoSalva;
  onEnviar?: (dados: DadosProducao) => ReturnType<EnviarProducao>;
}) {
  const tx = useDicionario().exercicio;
  const [salva, setSalva] = useState(salvaInicial);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [acabouDeEnviar, setAcabouDeEnviar] = useState(false);

  async function enviar(dados: DadosProducao) {
    if (!onEnviar) return;
    setEnviando(true);
    setErro(null);
    const r = await onEnviar(dados).catch(() => ({ ok: false as const, erro: tx.semConexao }));
    setEnviando(false);
    if (r.ok) {
      setSalva(r.salva);
      setAcabouDeEnviar(true);
    } else {
      setErro(r.erro);
    }
  }

  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <p className="whitespace-pre-line">{item.enunciado}</p>

      {salva?.correcao && <CaixaCorrecao correcao={salva.correcao} />}

      <div className="mt-3">
        {item.modo === "escrita" ? (
          <Escrita inicial={salva?.texto ?? ""} enviando={enviando} jaEnviou={Boolean(salva)} podeEnviar={Boolean(onEnviar)} onEnviar={(texto) => enviar({ texto })} />
        ) : (
          <Oral
            key={salva?.enviadaEm ?? "nova"}
            audioEnviado={salva?.audioUrl ?? null} enviando={enviando} podeEnviar={Boolean(onEnviar)} onEnviar={(audio) => enviar({ audio })} />
        )}
      </div>

      {erro && (
        <p role="alert" className="mt-2 text-sm font-semibold text-erro">
          {erro}
        </p>
      )}
      {acabouDeEnviar && !erro && (
        <p role="status" className="mt-2 text-sm font-semibold text-certo">
          {tx.enviadoComentar}
        </p>
      )}
      {!acabouDeEnviar && salva && !salva.correcao && (
        <p className="mt-2 text-sm text-tinta-suave">{tx.aguardando}</p>
      )}
      {!onEnviar && (
        <p className="mt-2 text-sm text-tinta-suave">{tx.soAlunos}</p>
      )}
    </div>
  );
}

function CaixaCorrecao({ correcao }: { correcao: Correcao }) {
  const tx = useDicionario().exercicio;
  const bem = correcao.avaliacao === "muito_bem";
  return (
    <div className={`mt-3 rounded-xl p-3.5 text-sm ${bem ? "bg-certo-fundo text-certo" : "bg-aviso-fundo text-aviso"}`}>
      <p className="font-bold">
        {correcao.anterior ? tx.versaoAnterior : ""}
        {bem ? tx.muitoBem : tx.refazer}
      </p>
      {correcao.comentario && <p className="mt-1 whitespace-pre-line text-tinta">{correcao.comentario}</p>}
    </div>
  );
}

function Escrita({
  inicial,
  enviando,
  jaEnviou,
  podeEnviar,
  onEnviar,
}: {
  inicial: string;
  enviando: boolean;
  jaEnviou: boolean;
  podeEnviar: boolean;
  onEnviar: (texto: string) => void;
}) {
  const tx = useDicionario().exercicio;
  const id = useId();
  const [texto, setTexto] = useState(inicial);
  const vazio = !texto.trim();
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="sr-only">
        {tx.suaResposta}
      </label>
      <textarea
        id={id}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={5}
        maxLength={5000}
        placeholder={tx.escrevaAqui}
        className={campo}
      />
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-tinta-suave tabular-nums">{texto.length} / 5000</span>
        <button
          type="button"
          disabled={!podeEnviar || vazio || enviando || (jaEnviou && texto === inicial)}
          onClick={() => onEnviar(texto.trim())}
          className={botaoPrimario}
        >
          {enviando ? tx.enviando : jaEnviou ? tx.enviarNovaVersao : tx.enviarParaProfessor}
        </button>
      </div>
    </div>
  );
}

/** Formato que o navegador sabe gravar (Chrome/Firefox: webm; Safari: mp4). */
function formatoDeGravacao() {
  if (typeof MediaRecorder === "undefined") return null;
  return ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"].find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
}

function Oral({
  audioEnviado,
  enviando,
  podeEnviar,
  onEnviar,
}: {
  audioEnviado: string | null;
  enviando: boolean;
  podeEnviar: boolean;
  onEnviar: (audio: Blob) => void;
}) {
  const tx = useDicionario().exercicio;
  const [estado, setEstado] = useState<"parado" | "gravando">("parado");
  const [gravacao, setGravacao] = useState<{ blob: Blob; url: string } | null>(null);
  const [segundos, setSegundos] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const gravador = useRef<MediaRecorder | null>(null);

  // Libera o microfone e o arquivo temporário ao sair da página.
  useEffect(() => {
    return () => {
      gravador.current?.stream.getTracks().forEach((t) => t.stop());
    };
  }, []);
  useEffect(() => {
    return () => {
      if (gravacao) URL.revokeObjectURL(gravacao.url);
    };
  }, [gravacao]);

  useEffect(() => {
    if (estado !== "gravando") return;
    const relogio = setInterval(() => {
      setSegundos((s) => {
        if (s + 1 >= MAX_GRAVACAO_S) gravador.current?.stop();
        return s + 1;
      });
    }, 1000);
    return () => clearInterval(relogio);
  }, [estado]);

  async function gravar() {
    setAviso(null);
    const formato = formatoDeGravacao();
    if (formato === null || !navigator.mediaDevices?.getUserMedia) {
      setAviso(tx.semGravar);
      return;
    }
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setAviso(tx.semMicrofone);
      return;
    }
    const rec = new MediaRecorder(stream, formato ? { mimeType: formato } : undefined);
    const partes: Blob[] = [];
    rec.ondataavailable = (e) => e.data.size > 0 && partes.push(e.data);
    rec.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      const tipo = (rec.mimeType || formato || "audio/webm").split(";")[0];
      const blob = new Blob(partes, { type: tipo });
      setGravacao({ blob, url: URL.createObjectURL(blob) });
      setEstado("parado");
    };
    gravador.current = rec;
    setSegundos(0);
    setGravacao(null);
    rec.start();
    setEstado("gravando");
  }

  const tempo = `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, "0")}`;

  return (
    <div className="space-y-3 rounded-xl bg-suave p-3.5">
      {audioEnviado && !gravacao && (
        <div>
          <p className="mb-1 text-sm font-bold">{tx.gravacaoEnviada}</p>
          <audio controls preload="metadata" src={audioEnviado} className="w-full" />
        </div>
      )}

      {gravacao && (
        <div>
          <p className="mb-1 text-sm font-bold">{tx.ouca}</p>
          <audio controls src={gravacao.url} className="w-full" />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {estado === "gravando" ? (
          <>
            <button type="button" onClick={() => gravador.current?.stop()} className={botaoSecundario}>
              ■ {tx.parar}
            </button>
            <span className="flex items-center gap-2 text-sm font-bold text-erro tabular-nums" role="status">
              <span className="size-2.5 animate-pulse rounded-full bg-erro motion-reduce:animate-none" aria-hidden />
              {fmt(tx.gravando, { tempo })}
            </span>
          </>
        ) : (
          <button type="button" onClick={gravar} disabled={enviando} className={botaoSecundario}>
            ● {gravacao || audioEnviado ? tx.gravarDeNovo : tx.gravar}
          </button>
        )}
        {gravacao && estado === "parado" && (
          <button
            type="button"
            disabled={!podeEnviar || enviando}
            onClick={() => onEnviar(gravacao.blob)}
            className={botaoPrimario}
          >
            {enviando ? tx.enviando : tx.enviarParaProfessor}
          </button>
        )}
      </div>
      {aviso && (
        <p role="alert" className="text-sm font-semibold text-erro">
          {aviso}
        </p>
      )}
      <p className="text-xs text-tinta-suave">{tx.ate5}</p>
    </div>
  );
}
