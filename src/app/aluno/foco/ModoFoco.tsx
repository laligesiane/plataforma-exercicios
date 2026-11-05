"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PlantaFoco } from "@/components/PlantaFoco";
import { botaoPrimario, botaoSecundario } from "@/components/ui/estilos";
import {
  CHAVE_JARDIM,
  DURACAO_PADRAO,
  DURACOES_MIN,
  FASES,
  diaLocal,
  faseDoProgresso,
  formatarTempo,
  lerJardim,
  plantarArvore,
  type Jardim,
} from "@/lib/foco";

type Estado = "pronto" | "rodando" | "pausado" | "concluido";

function salvarJardim(j: Jardim) {
  try {
    localStorage.setItem(CHAVE_JARDIM, JSON.stringify(j));
  } catch {
    /* sem armazenamento: o jardim vale só nesta visita */
  }
}

/**
 * Cronômetro de estudo: o Brotinho cresce enquanto o tempo corre.
 * Se o aluno troca de aba ou minimiza, o tempo pausa e o Brotinho fica com sono até ele voltar.
 */
export function ModoFoco() {
  const [duracao, setDuracao] = useState<number>(DURACAO_PADRAO);
  const [estado, setEstado] = useState<Estado>("pronto");
  const [restante, setRestante] = useState(DURACAO_PADRAO * 60_000);
  const [saiu, setSaiu] = useState(false);
  const [jardim, setJardim] = useState<Jardim | null>(null);
  const fimEm = useRef(0);

  const total = duracao * 60_000;
  const fase = estado === "concluido" ? FASES.length - 1 : faseDoProgresso(1 - restante / total);

  useEffect(() => {
    let bruto: string | null = null;
    try {
      bruto = localStorage.getItem(CHAVE_JARDIM);
    } catch {}
    setJardim(lerJardim(bruto, diaLocal()));
  }, []);

  const concluir = useCallback(() => {
    setRestante(0);
    setEstado("concluido");
    setJardim((j) => {
      const novo = plantarArvore(j ?? lerJardim(null, diaLocal()), duracao, diaLocal());
      salvarJardim(novo);
      return novo;
    });
  }, [duracao]);

  // Relógio: conta pelo horário de término, para não atrasar quando o navegador segura o timer.
  useEffect(() => {
    if (estado !== "rodando") return;
    const id = setInterval(() => {
      const r = fimEm.current - Date.now();
      if (r <= 0) concluir();
      else setRestante(r);
    }, 250);
    return () => clearInterval(id);
  }, [estado, concluir]);

  // Sair da página pausa a sessão.
  useEffect(() => {
    if (estado !== "rodando") return;
    function aoMudarVisibilidade() {
      if (document.visibilityState === "hidden") {
        const r = fimEm.current - Date.now();
        if (r <= 0) return concluir();
        setRestante(r);
        setEstado("pausado");
        setSaiu(true);
      }
    }
    function aoSair(e: BeforeUnloadEvent) {
      e.preventDefault();
    }
    document.addEventListener("visibilitychange", aoMudarVisibilidade);
    window.addEventListener("beforeunload", aoSair);
    return () => {
      document.removeEventListener("visibilitychange", aoMudarVisibilidade);
      window.removeEventListener("beforeunload", aoSair);
    };
  }, [estado, concluir]);

  // Tempo na aba do navegador.
  useEffect(() => {
    const original = document.title;
    if (estado === "rodando" || estado === "pausado") document.title = `${formatarTempo(restante)} · Modo foco`;
    return () => {
      document.title = original;
    };
  }, [estado, restante]);

  function escolherDuracao(min: number) {
    setDuracao(min);
    setRestante(min * 60_000);
  }

  function iniciar() {
    fimEm.current = Date.now() + restante;
    setSaiu(false);
    setEstado("rodando");
  }

  function pausar() {
    setRestante(Math.max(0, fimEm.current - Date.now()));
    setEstado("pausado");
  }

  function recomecar() {
    setEstado("pronto");
    setSaiu(false);
    setRestante(duracao * 60_000);
  }

  const emSessao = estado === "rodando" || estado === "pausado";
  let frase: string = FASES[fase].frase;
  if (estado === "pronto") frase = "Plante a sementinha e comece a estudar.";
  else if (saiu && estado === "pausado") frase = "Você saiu da página e o Brotinho pegou no sono. Volte quando quiser!";
  else if (estado === "pausado") frase = "Pausado. O Brotinho está tirando um cochilo.";

  return (
    <div className="mt-8 flex flex-col items-center text-center">
      <div className="w-full rounded-3xl bg-primaria-suave px-4 pt-6 pb-5">
        <div key={fase} className="foco-nova-fase mx-auto w-fit">
          <PlantaFoco fase={fase} pausado={estado === "pausado" || estado === "pronto"} tamanho={220} />
        </div>
        <p className="mt-2 text-sm font-bold text-primaria">{estado === "pronto" ? "Semente" : FASES[fase].nome}</p>
      </div>

      <p className="mt-6 text-6xl font-extrabold tabular-nums tracking-tight" aria-live="off">
        {formatarTempo(restante)}
      </p>
      <p role="status" aria-live="polite" className="mt-2 min-h-6 font-semibold text-tinta-suave">
        {estado === "concluido" ? `Sessão de ${duracao} minutos concluída. Você plantou uma árvore!` : frase}
      </p>

      {estado === "pronto" && (
        <fieldset className="mt-6">
          <legend className="mb-2 text-sm font-bold">Quanto tempo?</legend>
          <div className="flex flex-wrap justify-center gap-2">
            {DURACOES_MIN.map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={duracao === m}
                onClick={() => escolherDuracao(m)}
                className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
                  duracao === m ? "bg-tinta text-fundo" : "border border-linha text-tinta-suave hover:border-tinta hover:text-tinta"
                }`}
              >
                {m} min
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {estado === "pronto" && (
          <button type="button" className={botaoPrimario} onClick={iniciar}>
            Começar a estudar
          </button>
        )}
        {estado === "rodando" && (
          <button type="button" className={botaoSecundario} onClick={pausar}>
            Pausar
          </button>
        )}
        {estado === "pausado" && (
          <button type="button" className={botaoPrimario} onClick={iniciar}>
            Continuar
          </button>
        )}
        {emSessao && (
          <button type="button" className={botaoSecundario} onClick={recomecar}>
            Desistir
          </button>
        )}
        {estado === "concluido" && (
          <button type="button" className={botaoPrimario} onClick={recomecar}>
            Plantar outra
          </button>
        )}
      </div>

      {jardim && jardim.arvores > 0 && (
        <section className="mt-10 w-full rounded-2xl border border-linha p-4 text-left">
          <h2 className="font-extrabold">Seu jardim de hoje</h2>
          <p className="text-sm text-tinta-suave">
            {jardim.arvores} {jardim.arvores === 1 ? "árvore" : "árvores"} · {jardim.minutos} minutos de estudo
          </p>
          <ul className="mt-3 flex flex-wrap gap-1" aria-hidden>
            {Array.from({ length: Math.min(jardim.arvores, 24) }, (_, i) => (
              <li key={i}>
                <PlantaFoco fase={FASES.length - 1} tamanho={44} animado={false} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
