"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { campo as estiloCampo } from "@/components/ui/estilos";

// Calendário da Repasa no lugar do seletor de data do navegador.
// Guarda o valor como "AAAA-MM-DD", igual ao <input type="date">, então os formulários não mudam.

const MESES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];
const DIAS_SEMANA = [
  ["D", "domingo"],
  ["S", "segunda"],
  ["T", "terça"],
  ["Q", "quarta"],
  ["Q", "quinta"],
  ["S", "sexta"],
  ["S", "sábado"],
] as const;

const formatoBotao = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});
const formatoLongo = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function paraTexto(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function deTexto(v: string | null | undefined): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v ?? "");
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

function mesmoDia(a: Date | null, b: Date | null) {
  return !!a && !!b && paraTexto(a) === paraTexto(b);
}

function Svg({
  children,
  className = "size-5",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

const IconeCalendario = ({ className }: { className?: string }) => (
  <Svg className={className}>
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </Svg>
);
const IconeEsquerda = () => (
  <Svg>
    <path d="m15 6-6 6 6 6" />
  </Svg>
);
const IconeDireita = () => (
  <Svg>
    <path d="m9 6 6 6-6 6" />
  </Svg>
);
const IconeAbaixo = () => (
  <Svg className="size-4">
    <path d="m6 9 6 6 6-6" />
  </Svg>
);

const botaoSeta =
  "flex size-9 items-center justify-center rounded-full text-tinta-suave transition-colors hover:bg-primaria-suave hover:text-primaria disabled:opacity-30 disabled:hover:bg-transparent focus-visible:outline-2 focus-visible:outline-primaria";

export function CampoData({
  id,
  name,
  value,
  defaultValue = "",
  onChange,
  min,
  max,
  required,
  placeholder = "Escolher data",
  className = "",
}: {
  id?: string;
  name?: string;
  /** Use value + onChange para controlar de fora; ou defaultValue para formulário comum. */
  value?: string;
  defaultValue?: string;
  onChange?: (valor: string) => void;
  min?: string;
  max?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}) {
  const controlado = value !== undefined;
  const [interno, setInterno] = useState(defaultValue);
  const valor = controlado ? value : interno;
  const selecionada = deTexto(valor);
  const minimo = deTexto(min);
  const maximo = deTexto(max);

  const [aberto, setAberto] = useState(false);
  const [modo, setModo] = useState<"dias" | "meses">("dias");
  const hoje = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }, []);
  const [foco, setFoco] = useState<Date>(selecionada ?? hoje);

  const caixa = useRef<HTMLDivElement>(null);
  const botao = useRef<HTMLButtonElement>(null);
  const escondido = useRef<HTMLInputElement>(null);
  const grade = useRef<HTMLDivElement>(null);
  const idGerado = useId();
  const idCampo = id ?? `data-${idGerado}`;
  const idDialogo = `${idCampo}-calendario`;

  function escolher(novo: string) {
    if (!controlado) setInterno(novo);
    onChange?.(novo);
  }

  // form.reset() volta ao valor inicial também aqui.
  useEffect(() => {
    const form = escondido.current?.form;
    if (!form || controlado) return;
    const voltar = () => setInterno(defaultValue);
    form.addEventListener("reset", voltar);
    return () => form.removeEventListener("reset", voltar);
  }, [controlado, defaultValue]);

  // Fecha ao clicar fora.
  useEffect(() => {
    if (!aberto) return;
    const fora = (e: PointerEvent) => {
      if (!caixa.current?.contains(e.target as Node)) setAberto(false);
    };
    document.addEventListener("pointerdown", fora);
    return () => document.removeEventListener("pointerdown", fora);
  }, [aberto]);

  // Leva o foco do teclado para o dia em destaque.
  useEffect(() => {
    if (aberto && modo === "dias") {
      grade.current
        ?.querySelector<HTMLButtonElement>(`[data-dia="${paraTexto(foco)}"]`)
        ?.focus();
    }
  }, [aberto, modo, foco]);

  function abrir() {
    setFoco(selecionada ?? (minimo && minimo > hoje ? minimo : hoje));
    setModo("dias");
    setAberto(true);
  }

  function fechar() {
    setAberto(false);
    botao.current?.focus();
  }

  function foraDoLimite(d: Date) {
    return (!!minimo && d < minimo) || (!!maximo && d > maximo);
  }

  function escolherDia(d: Date) {
    if (foraDoLimite(d)) return;
    escolher(paraTexto(d));
    fechar();
  }

  function mudarMes(delta: number) {
    const ultimo = new Date(
      foco.getFullYear(),
      foco.getMonth() + delta + 1,
      0,
    ).getDate();
    setFoco(
      new Date(
        foco.getFullYear(),
        foco.getMonth() + delta,
        Math.min(foco.getDate(), ultimo),
      ),
    );
  }

  function teclado(e: KeyboardEvent<HTMLDivElement>) {
    const passos: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };
    if (e.key in passos) {
      e.preventDefault();
      setFoco(
        new Date(
          foco.getFullYear(),
          foco.getMonth(),
          foco.getDate() + passos[e.key],
        ),
      );
    } else if (e.key === "PageUp" || e.key === "PageDown") {
      e.preventDefault();
      mudarMes(e.key === "PageUp" ? -1 : 1);
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      const d = new Date(foco);
      d.setDate(
        foco.getDate() +
          (e.key === "Home" ? -foco.getDay() : 6 - foco.getDay()),
      );
      setFoco(d);
    }
  }

  const ano = foco.getFullYear();
  const mes = foco.getMonth();
  const primeiroDia = new Date(ano, mes, 1).getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const celulas: (Date | null)[] = [
    ...Array.from({ length: primeiroDia }, () => null),
    ...Array.from({ length: diasNoMes }, (_, i) => new Date(ano, mes, i + 1)),
  ];
  const mesAnteriorBloqueado = !!minimo && new Date(ano, mes, 0) < minimo;
  const proximoMesBloqueado = !!maximo && new Date(ano, mes + 1, 1) > maximo;

  return (
    <div ref={caixa} className="relative">
      <button
        ref={botao}
        id={idCampo}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={aberto}
        aria-controls={aberto ? idDialogo : undefined}
        onClick={() => (aberto ? setAberto(false) : abrir())}
        className={`${estiloCampo} flex items-center justify-between gap-2 text-left ${className}`}
      >
        <span className={selecionada ? "" : "text-tinta-suave"}>
          {selecionada ? formatoBotao.format(selecionada) : placeholder}
        </span>
        <IconeCalendario className="size-5 shrink-0 text-primaria" />
      </button>
      {/* Valor que vai no formulário; também mostra o aviso de "campo obrigatório" do navegador. */}
      <input
        ref={escondido}
        name={name}
        value={valor}
        required={required}
        onChange={() => {}}
        onFocus={() => botao.current?.focus()}
        tabIndex={-1}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px w-full opacity-0"
      />

      {aberto && (
        <div
          id={idDialogo}
          role="dialog"
          aria-modal="false"
          aria-label="Escolher data"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.stopPropagation();
              fechar();
            }
          }}
          className="absolute top-full left-0 z-40 mt-2 w-[19rem] max-w-[calc(100vw-2rem)] rounded-3xl border border-linha bg-fundo p-4 shadow-xl"
        >
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() =>
                modo === "dias"
                  ? mudarMes(-1)
                  : setFoco(new Date(ano - 1, mes, 1))
              }
              disabled={modo === "dias" && mesAnteriorBloqueado}
              aria-label={modo === "dias" ? "Mês anterior" : "Ano anterior"}
              className={botaoSeta}
            >
              <IconeEsquerda />
            </button>
            <button
              type="button"
              onClick={() => setModo(modo === "dias" ? "meses" : "dias")}
              aria-label={
                modo === "dias"
                  ? `${MESES[mes]} de ${ano}. Escolher outro mês ou ano`
                  : `Voltar para os dias de ${MESES[mes]}`
              }
              className="flex items-center gap-1 rounded-full px-3 py-1.5 font-bold capitalize transition-colors hover:bg-primaria-suave hover:text-primaria focus-visible:outline-2 focus-visible:outline-primaria"
            >
              {modo === "dias" ? `${MESES[mes]} ${ano}` : ano}
              <span
                className={`transition-transform ${modo === "meses" ? "rotate-180" : ""}`}
              >
                <IconeAbaixo />
              </span>
            </button>
            <button
              type="button"
              onClick={() =>
                modo === "dias"
                  ? mudarMes(1)
                  : setFoco(new Date(ano + 1, mes, 1))
              }
              disabled={modo === "dias" && proximoMesBloqueado}
              aria-label={modo === "dias" ? "Próximo mês" : "Próximo ano"}
              className={botaoSeta}
            >
              <IconeDireita />
            </button>
          </div>

          {modo === "dias" ? (
            <div ref={grade} onKeyDown={teclado} className="mt-3">
              <div
                aria-hidden
                className="grid grid-cols-7 text-center text-xs font-bold text-tinta-suave"
              >
                {DIAS_SEMANA.map(([letra, nome]) => (
                  <span key={nome} className="py-1">
                    {letra}
                  </span>
                ))}
              </div>
              <div className="mt-1 grid grid-cols-7 gap-y-1">
                {celulas.map((d, i) =>
                  d ? (
                    <span key={i} className="flex justify-center">
                      <button
                        type="button"
                        data-dia={paraTexto(d)}
                        tabIndex={mesmoDia(d, foco) ? 0 : -1}
                        disabled={foraDoLimite(d)}
                        aria-pressed={mesmoDia(d, selecionada)}
                        aria-current={mesmoDia(d, hoje) ? "date" : undefined}
                        aria-label={formatoLongo.format(d)}
                        onClick={() => escolherDia(d)}
                        className={`flex size-9 items-center justify-center rounded-full text-sm tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primaria disabled:cursor-not-allowed disabled:opacity-30 ${
                          mesmoDia(d, selecionada)
                            ? "bg-primaria font-bold text-white"
                            : mesmoDia(d, hoje)
                              ? "font-bold text-primaria ring-2 ring-primaria/40 ring-inset hover:bg-primaria-suave"
                              : "hover:bg-primaria-suave hover:text-primaria"
                        }`}
                      >
                        {d.getDate()}
                      </button>
                    </span>
                  ) : (
                    <span key={i} aria-hidden />
                  ),
                )}
              </div>
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {MESES.map((nome, i) => (
                <button
                  key={nome}
                  type="button"
                  onClick={() => {
                    const ultimo = new Date(ano, i + 1, 0).getDate();
                    setFoco(new Date(ano, i, Math.min(foco.getDate(), ultimo)));
                    setModo("dias");
                  }}
                  aria-pressed={i === mes}
                  className={`rounded-2xl py-2.5 text-sm capitalize transition-colors focus-visible:outline-2 focus-visible:outline-primaria ${
                    i === mes
                      ? "bg-primaria font-bold text-white"
                      : "bg-suave hover:bg-primaria-suave hover:text-primaria"
                  }`}
                >
                  {nome.slice(0, 3)}
                </button>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center justify-between border-t border-linha pt-3 text-sm font-bold">
            {!required && valor ? (
              <button
                type="button"
                onClick={() => {
                  escolher("");
                  fechar();
                }}
                className="rounded-full px-3 py-1.5 text-tinta-suave hover:bg-suave hover:text-tinta"
              >
                Limpar
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={() => escolherDia(hoje)}
              disabled={foraDoLimite(hoje)}
              className="rounded-full bg-primaria-suave px-4 py-1.5 text-primaria hover:opacity-80 disabled:opacity-40"
            >
              Hoje
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
