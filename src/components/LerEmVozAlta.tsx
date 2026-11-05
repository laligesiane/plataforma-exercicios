"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { opcoesDeVoz, partesDaFala, VELOCIDADES, type OpcaoVoz } from "@/lib/fala";
import { AMOSTRA, urlDaVoz, VOZES_NATURAIS } from "@/lib/fala/natural";

const CHAVE_PREFERENCIA = "repasa:leitura-voz";
const temVozDoAparelho = () => typeof window !== "undefined" && "speechSynthesis" in window;

type Preferencia = { voz?: string; velocidade: number };

function lerPreferencia(): Preferencia {
  try {
    const p = JSON.parse(localStorage.getItem(CHAVE_PREFERENCIA) ?? "{}") as Partial<Preferencia>;
    const velocidade = VELOCIDADES.includes(p.velocidade as (typeof VELOCIDADES)[number]) ? p.velocidade! : 1;
    return { voz: typeof p.voz === "string" ? p.voz : undefined, velocidade };
  } catch {
    return { velocidade: 1 };
  }
}

function salvarPreferencia(p: Preferencia) {
  try {
    localStorage.setItem(CHAVE_PREFERENCIA, JSON.stringify(p));
  } catch {
    // Sem armazenamento (aba anônima): a escolha vale só nesta página.
  }
}

/** Vozes do navegador. No Chrome e no Safari elas chegam depois de a página abrir. */
function useVozes() {
  const [vozes, setVozes] = useState<SpeechSynthesisVoice[]>([]);
  useEffect(() => {
    if (!temVozDoAparelho()) return;
    const carregar = () => setVozes(speechSynthesis.getVoices());
    carregar();
    speechSynthesis.addEventListener("voiceschanged", carregar);
    return () => speechSynthesis.removeEventListener("voiceschanged", carregar);
  }, []);
  return vozes;
}

type Estado = "parado" | "lendo" | "pausado";

/**
 * Lê o resumo em voz alta. Com `assinaturas` (chave da Azure configurada), oferece primeiro as vozes
 * naturais, que vêm como áudio de /api/voz; sem elas, ou se a cota do mês acabar, usa a voz do navegador.
 * O aluno escolhe a voz (sempre há pelo menos duas) e a velocidade; a escolha fica guardada no aparelho.
 * Enquanto lê, o trecho atual fica marcado no texto e uma barra de controles fica presa no rodapé,
 * para dar para rolar o resumo no celular sem perder o botão de pausar.
 * `alvo` é o id do elemento onde estão os blocos com data-trecho (ver <Documento>).
 */
export function LerEmVozAlta({
  titulo,
  trechos,
  alvo,
  idioma = "pt-BR",
  assinaturas,
}: {
  titulo: string;
  trechos: string[];
  alvo: string;
  idioma?: string;
  /** Assinatura de cada parte da fala, para pedir o áudio com voz natural. */
  assinaturas?: Record<string, string>;
}) {
  const [disponivel, setDisponivel] = useState(false);
  useEffect(() => setDisponivel(temVozDoAparelho() || Boolean(assinaturas)), [assinaturas]);
  if (!disponivel || !trechos.length) return null;
  return <Leitor titulo={titulo} trechos={trechos} alvo={alvo} idioma={idioma} assinaturas={assinaturas} />;
}

const opcoesNaturais: OpcaoVoz[] = VOZES_NATURAIS.map((v) => ({ id: v.id, rotulo: v.rotulo, tom: 1, natural: v.id }));

function Leitor({
  titulo,
  trechos,
  alvo,
  idioma,
  assinaturas,
}: {
  titulo: string;
  trechos: string[];
  alvo: string;
  idioma: string;
  assinaturas?: Record<string, string>;
}) {
  const vozes = useVozes();
  // Se a voz natural falhar (cota do mês acabou, sem internet), some da lista e a leitura segue com a do aparelho.
  const [naturalFalhou, setNaturalFalhou] = useState(false);
  const opcoes = useMemo(() => {
    const doAparelho = temVozDoAparelho() ? opcoesDeVoz(vozes, idioma) : [];
    // Com voz natural, só ela aparece; a do aparelho fica de reserva para quando a cota do mês acabar.
    return assinaturas && !naturalFalhou ? opcoesNaturais : doAparelho;
  }, [vozes, idioma, assinaturas, naturalFalhou]);
  const [pref, setPref] = useState<Preferencia>({ velocidade: 1 });
  useEffect(() => setPref(lerPreferencia()), []);
  const opcao = opcoes.find((o) => o.id === pref.voz) ?? opcoes[0];

  // O título vem antes do primeiro trecho (índice -1) e não tem bloco para marcar.
  const partes = useMemo(() => [partesDaFala(titulo), ...trechos.map((t) => partesDaFala(t))], [titulo, trechos]);
  const [estado, setEstado] = useState<Estado>("parado");
  const [indice, setIndice] = useState(-1);
  const [painel, setPainel] = useState(false);
  const posicao = useRef({ indice: -1, parte: 0 });
  // Cada fala nova invalida as anteriores: o cancel() dispara onend/onerror em alguns navegadores.
  const geracao = useRef(0);
  const config = useRef({ opcao, velocidade: pref.velocidade });
  config.current = { opcao, velocidade: pref.velocidade };
  const montarFala = useCallback(
    (texto: string, o: OpcaoVoz | undefined, velocidade: number) => {
      const fala = new SpeechSynthesisUtterance(texto);
      fala.lang = idioma;
      fala.rate = velocidade;
      fala.pitch = o?.tom ?? 1;
      const voz = o?.voiceURI ? speechSynthesis.getVoices().find((v) => v.voiceURI === o.voiceURI) : undefined;
      if (voz) {
        fala.voice = voz;
        fala.lang = voz.lang;
      }
      return fala;
    },
    [idioma],
  );

  // Um só elemento de áudio para a leitura toda: o iPhone só deixa tocar o que começou num toque.
  const audio = useRef<HTMLAudioElement | null>(null);

  const silenciar = useCallback(() => {
    if (temVozDoAparelho()) speechSynthesis.cancel();
    audio.current?.pause();
  }, []);

  /** Toca um texto com a opção escolhida e chama `depois` ao terminar. Devolve false se não conseguiu. */
  const tocar = useCallback(
    (texto: string, o: OpcaoVoz | undefined, velocidade: number, minha: number, depois: () => void, falhou: () => void) => {
      const assinatura = o?.natural ? assinaturas?.[texto] : undefined;
      if (o?.natural && assinatura) {
        audio.current ??= new Audio();
        const el = audio.current;
        el.src = urlDaVoz(texto, o.natural, assinatura);
        el.playbackRate = velocidade;
        el.onended = () => minha === geracao.current && depois();
        el.onerror = () => minha === geracao.current && falhou();
        el.play().catch((e: DOMException) => {
          if (minha === geracao.current && e.name !== "AbortError") falhou();
        });
        return;
      }
      if (!temVozDoAparelho()) return falhou();
      const fala = montarFala(texto, o?.natural ? undefined : o, velocidade);
      fala.onend = () => minha === geracao.current && depois();
      fala.onerror = (e) => {
        if (minha !== geracao.current || e.error === "interrupted" || e.error === "canceled") return;
        setEstado("parado");
      };
      speechSynthesis.speak(fala);
    },
    [assinaturas, montarFala],
  );

  const falarDe = useCallback(
    (i: number, parte = 0) => {
      const minha = ++geracao.current;
      silenciar();
      // Pula trechos vazios e termina depois do último.
      while (i < trechos.length && !partes[i + 1]?.[parte]) {
        i++;
        parte = 0;
      }
      if (i >= trechos.length) {
        posicao.current = { indice: -1, parte: 0 };
        setIndice(-1);
        setEstado("parado");
        return;
      }
      posicao.current = { indice: i, parte };
      setIndice(i);
      setEstado("lendo");
      const fim = parte + 1 >= partes[i + 1].length;
      const proxima: [number, number] = fim ? [i + 1, 0] : [i, parte + 1];
      const o = config.current.opcao;
      tocar(
        partes[i + 1][parte],
        o,
        config.current.velocidade,
        minha,
        () => falarDe(...proxima),
        () => {
          // Voz natural indisponível: continua do mesmo ponto com a melhor voz do aparelho.
          setNaturalFalhou(true);
          const reserva = temVozDoAparelho() ? opcoesDeVoz(speechSynthesis.getVoices(), idioma)[0] : undefined;
          if (!o?.natural || !reserva) return setEstado("parado");
          config.current = { ...config.current, opcao: reserva };
          falarDe(i, parte);
        },
      );
      // Já pede o áudio da próxima parte, para não ter pausa entre as frases.
      const seguinte = partes[proxima[0] + 1]?.[proxima[1]];
      const assinatura = seguinte && o?.natural ? assinaturas?.[seguinte] : undefined;
      if (seguinte && o?.natural && assinatura) void fetch(urlDaVoz(seguinte, o.natural, assinatura)).catch(() => {});
    },
    [silenciar, tocar, partes, trechos.length, idioma, assinaturas],
  );

  const parar = useCallback(() => {
    geracao.current++;
    silenciar();
    posicao.current = { indice: -1, parte: 0 };
    setIndice(-1);
    setEstado("parado");
    setPainel(false);
  }, [silenciar]);

  // Pausar = parar guardando o lugar. O pause() do navegador não funciona bem no Android.
  const pausar = () => {
    geracao.current++;
    silenciar();
    setEstado("pausado");
  };
  const continuar = () => falarDe(posicao.current.indice, posicao.current.parte);

  useEffect(
    () => () => {
      geracao.current++;
      silenciar();
    },
    [silenciar],
  );

  // Marca o trecho lido e o traz para a tela, se tiver saído dela.
  useEffect(() => {
    if (estado === "parado" || indice < 0) return;
    const el = document.getElementById(alvo)?.querySelector<HTMLElement>(`[data-trecho="${indice}"]`);
    if (!el) return;
    el.classList.add("lendo-agora");
    const r = el.getBoundingClientRect();
    const barra = window.innerHeight - 160;
    if (r.top < 80 || r.bottom > barra) {
      const suave = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ block: "center", behavior: suave ? "smooth" : "auto" });
    }
    return () => el.classList.remove("lendo-agora");
  }, [alvo, indice, estado]);

  // Espaço no fim da página para a barra não cobrir o fim do resumo. No celular ela fica em cima
  // da barra de abas, cuja altura vem em --altura-barra.
  const ativo = estado !== "parado";
  useEffect(() => {
    if (!ativo) return;
    const antes = document.body.style.paddingBottom;
    document.body.style.paddingBottom = "calc(7rem + var(--altura-barra, 0px))";
    return () => {
      document.body.style.paddingBottom = antes;
    };
  }, [ativo]);

  // Com a leitura ligada, tocar num parágrafo lê a partir dele.
  useEffect(() => {
    if (estado === "parado") return;
    const raiz = document.getElementById(alvo);
    if (!raiz) return;
    raiz.classList.add("leitura-ativa");
    const aoTocar = (e: MouseEvent) => {
      if (window.getSelection()?.toString()) return;
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-trecho]");
      if (el && raiz.contains(el)) falarDe(Number(el.dataset.trecho));
    };
    raiz.addEventListener("click", aoTocar);
    return () => {
      raiz.classList.remove("leitura-ativa");
      raiz.removeEventListener("click", aoTocar);
    };
  }, [alvo, estado, falarDe]);

  function escolher(nova: Partial<Preferencia>) {
    const p = { ...pref, ...nova };
    setPref(p);
    salvarPreferencia(p);
    config.current = { opcao: opcoes.find((o) => o.id === p.voz) ?? opcoes[0], velocidade: p.velocidade };
    if (estado === "lendo") {
      // Recomeça a frase atual com a voz nova: o aluno ouve na hora como ficou.
      falarDe(posicao.current.indice, posicao.current.parte);
    } else if (estado === "parado" && nova.voz) {
      const minha = ++geracao.current;
      silenciar();
      tocar(AMOSTRA, config.current.opcao, p.velocidade, minha, () => {}, () => setNaturalFalhou(true));
    }
  }

  const botao =
    "inline-flex size-11 shrink-0 items-center justify-center rounded-full text-tinta transition-colors hover:bg-suave disabled:opacity-40";

  return (
    <>
      <span className="inline-flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <button
          type="button"
          onClick={() => {
            if (estado === "lendo") return pausar();
            if (estado === "pausado") return continuar();
            setPainel(false);
            falarDe(-1);
          }}
          className="text-sm font-bold text-primaria hover:underline"
        >
          {estado === "lendo" ? "⏸ Pausar leitura" : estado === "pausado" ? "▶ Continuar" : "🔊 Ouvir o resumo"}
        </button>
        {!ativo && (
          <button
            type="button"
            onClick={() => setPainel((p) => !p)}
            aria-expanded={painel}
            className="text-sm font-bold text-tinta-suave hover:text-tinta"
          >
            Voz: {opcao?.rotulo ?? "padrão"} · {formatarVelocidade(pref.velocidade)} {painel ? "▴" : "▾"}
          </button>
        )}
      </span>

      {!ativo && painel && (
        <div className="mt-3 max-w-xl rounded-2xl border border-linha bg-fundo p-4">
          <EscolhaDeVoz opcoes={opcoes} atual={opcao?.id} velocidade={pref.velocidade} escolher={escolher} amostra naturalFalhou={naturalFalhou} />
        </div>
      )}

      {ativo && (
        <>
          <div
            role="region"
            aria-label="Leitura em voz alta"
            className="fixed inset-x-0 bottom-[var(--altura-barra,0px)] z-40 border-t border-linha bg-fundo/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur sm:inset-x-auto sm:bottom-4 sm:left-1/2 sm:w-[32rem] sm:-translate-x-1/2 sm:rounded-2xl sm:border"
          >
            {painel && (
              <div className="max-h-[50vh] overflow-y-auto border-b border-linha p-4">
                <EscolhaDeVoz
                  opcoes={opcoes}
                  atual={opcao?.id}
                  velocidade={pref.velocidade}
                  escolher={escolher}
                  naturalFalhou={naturalFalhou}
                />
              </div>
            )}
            <div className="flex items-center gap-1 px-2 py-2 sm:px-3">
              <button
                type="button"
                onClick={() => falarDe(Math.max(0, posicao.current.indice - 1))}
                disabled={indice <= 0}
                aria-label="Trecho anterior"
                className={botao}
              >
                <Icone d="M19 20 9 12l10-8v16zM5 19V5" />
              </button>
              <button
                type="button"
                onClick={() => (estado === "lendo" ? pausar() : continuar())}
                aria-label={estado === "lendo" ? "Pausar" : "Continuar"}
                className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-primaria text-white transition-opacity hover:opacity-90"
              >
                {estado === "lendo" ? <Icone d="M8 5v14M16 5v14" grossa /> : <Icone d="M7 4v16l13-8z" cheia />}
              </button>
              <button
                type="button"
                onClick={() => falarDe(posicao.current.indice + 1)}
                disabled={indice >= trechos.length - 1}
                aria-label="Próximo trecho"
                className={botao}
              >
                <Icone d="m5 4 10 8-10 8V4zM19 5v14" />
              </button>

              <div className="min-w-0 flex-1 px-1">
                <p className="truncate text-sm font-bold">{estado === "pausado" ? "Pausado" : "Lendo o resumo"}</p>
                <p className="text-xs text-tinta-suave" aria-live="polite">
                  {indice < 0 ? "Título" : `Trecho ${indice + 1} de ${trechos.length}`}
                  <span className="hidden sm:inline"> · toque num parágrafo para ler dele</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPainel((p) => !p)}
                aria-expanded={painel}
                className="shrink-0 rounded-full px-3 py-2 text-sm font-bold text-primaria hover:bg-suave"
              >
                {formatarVelocidade(pref.velocidade)} · Voz
              </button>
              <button type="button" onClick={parar} aria-label="Parar leitura" className={botao}>
                <Icone d="M6 6l12 12M18 6 6 18" />
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function EscolhaDeVoz({
  opcoes,
  atual,
  velocidade,
  escolher,
  amostra = false,
  naturalFalhou = false,
}: {
  opcoes: OpcaoVoz[];
  atual?: string;
  velocidade: number;
  escolher: (p: Partial<Preferencia>) => void;
  amostra?: boolean;
  naturalFalhou?: boolean;
}) {
  const chip = (ativo: boolean) =>
    `rounded-full border px-3 py-1.5 text-sm font-bold transition-colors ${
      ativo ? "border-primaria bg-primaria-suave text-primaria" : "border-linha text-tinta hover:bg-suave"
    }`;
  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="text-xs font-bold tracking-wide text-tinta-suave uppercase">Voz</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {opcoes.map((o) => (
            <button
              key={o.id}
              type="button"
              aria-pressed={o.id === atual}
              onClick={() => escolher({ voz: o.id })}
              className={chip(o.id === atual)}
            >
              {o.rotulo}
              {o.detalhe && <span className="ml-1 font-normal text-tinta-suave">{o.detalhe}</span>}
            </button>
          ))}
        </div>
        {amostra && <p className="mt-2 text-xs text-tinta-suave">Toque numa voz para ouvir como ela soa.</p>}
      </fieldset>
      <fieldset>
        <legend className="text-xs font-bold tracking-wide text-tinta-suave uppercase">Velocidade</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {VELOCIDADES.map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={v === velocidade}
              onClick={() => escolher({ velocidade: v })}
              className={chip(v === velocidade)}
            >
              {formatarVelocidade(v)}
            </button>
          ))}
        </div>
      </fieldset>
      <p className="text-xs text-tinta-suave">
        {naturalFalhou
          ? "As vozes naturais não estão disponíveis agora (o limite grátis do mês pode ter acabado). Por enquanto a leitura usa as vozes do seu aparelho. "
          : opcoes.some((o) => o.natural)
            ? "Estas vozes soam iguais em qualquer celular ou computador. "
            : "As vozes são as do seu aparelho, então mudam de um celular ou navegador para outro. "}
        A escolha fica guardada aqui.
      </p>
    </div>
  );
}

const formatarVelocidade = (v: number) => `${String(v).replace(".", ",")}×`;

function Icone({ d, cheia = false, grossa = false }: { d: string; cheia?: boolean; grossa?: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-5"
      fill={cheia ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={grossa ? 3 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}
