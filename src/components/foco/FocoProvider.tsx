"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import {
  CHAVE_JARDIM,
  CHAVE_SESSAO,
  diaLocal,
  lerJardim,
  lerSessao,
  novaSessao,
  pausarSessao,
  plantarArvore,
  restanteDa,
  retomarSessao,
  type Jardim,
  type Sessao,
} from "@/lib/foco";
import { escolherEspecie } from "@/lib/foco/colecao";
import { colherArvore, type Colheita } from "@/app/aluno/foco/actions";

type Foco = {
  sessao: Sessao | null;
  agora: number;
  jardim: Jardim | null;
  /** Minutos da sessão que acabou de terminar, para comemorar; null quando não há nada a comemorar. */
  concluida: number | null;
  iniciar: (duracaoMin: number) => void;
  pausar: () => void;
  retomar: () => void;
  desistir: () => void;
  dispensarConclusao: () => void;
  /** A árvore que acabou de crescer (espécie e selos); null enquanto ainda está sendo guardada. */
  colheita: Colheita | null;
  celebrando: boolean;
  verArvore: () => void;
  fecharCelebracao: () => void;
};

const CHAVE_COLHEITA = "repasa:colheita";

function lerColheita(bruto: string | null): Colheita | null {
  if (!bruto) return null;
  try {
    const c = JSON.parse(bruto) as Colheita;
    return typeof c.especie === "string" && typeof c.minutos === "number" ? c : null;
  } catch {
    return null;
  }
}

const ContextoFoco = createContext<Foco | null>(null);

function ler(chave: string) {
  try {
    return localStorage.getItem(chave);
  } catch {
    return null;
  }
}

function gravar(chave: string, valor: string | null) {
  try {
    if (valor === null) localStorage.removeItem(chave);
    else localStorage.setItem(chave, valor);
  } catch {
    /* sem armazenamento: o foco vale só nesta aba */
  }
}

/**
 * Guarda a sessão de foco fora das páginas: o tempo segue correndo enquanto o aluno navega pela Repasa,
 * recarrega a página ou abre outra aba do site. Só pausa quando ele pede.
 */
export function FocoProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [jardim, setJardim] = useState<Jardim | null>(null);
  const [concluida, setConcluida] = useState<number | null>(null);
  const [agora, setAgora] = useState(() => Date.now());
  const [colheita, setColheita] = useState<Colheita | null>(null);
  const [celebrando, setCelebrando] = useState(false);

  const salvar = useCallback((s: Sessao | null) => {
    setSessao(s);
    gravar(CHAVE_SESSAO, s ? JSON.stringify(s) : null);
  }, []);

  useEffect(() => {
    setSessao(lerSessao(ler(CHAVE_SESSAO)));
    setJardim(lerJardim(ler(CHAVE_JARDIM), diaLocal()));
    // Outras abas da Repasa ficam em sincronia.
    function aoMudar(e: StorageEvent) {
      if (e.key === CHAVE_SESSAO) setSessao(lerSessao(e.newValue));
      if (e.key === CHAVE_JARDIM) setJardim(lerJardim(e.newValue, diaLocal()));
      if (e.key === CHAVE_COLHEITA) setColheita(lerColheita(e.newValue));
    }
    window.addEventListener("storage", aoMudar);
    return () => window.removeEventListener("storage", aoMudar);
  }, []);

  const dispensarConclusao = useCallback(() => {
    setConcluida(null);
    setCelebrando(false);
    setColheita(null);
  }, []);

  const rodando = sessao !== null && sessao.fimEm !== null;

  useEffect(() => {
    if (!rodando) return;
    const id = setInterval(() => setAgora(Date.now()), 500);
    return () => clearInterval(id);
  }, [rodando]);

  // Fim da sessão: planta a árvore uma vez só, mesmo com várias abas abertas.
  useEffect(() => {
    if (!sessao || sessao.fimEm === null || restanteDa(sessao, agora) > 0) return;
    const salva = lerSessao(ler(CHAVE_SESSAO));
    setSessao(null);
    setConcluida(sessao.duracaoMin);
    if (salva && salva.fimEm === sessao.fimEm) {
      gravar(CHAVE_SESSAO, null);
      const novo = plantarArvore(lerJardim(ler(CHAVE_JARDIM), diaLocal()), sessao.duracaoMin, diaLocal());
      gravar(CHAVE_JARDIM, JSON.stringify(novo));
      setJardim(novo);
      // Guarda a árvore na coleção da conta; sem conta ou sem rede, a comemoração acontece do mesmo jeito.
      const minutos = sessao.duracaoMin;
      gravar(CHAVE_COLHEITA, null);
      setColheita(null);
      colherArvore(minutos, diaLocal())
        .catch(() => null)
        .then((c) => {
          const final: Colheita = c ?? {
            especie: escolherEspecie([], null),
            minutos,
            especieNova: false,
            selos: [],
            proxima: null,
            salva: false,
          };
          setColheita(final);
          gravar(CHAVE_COLHEITA, JSON.stringify(final));
        });
    }
  }, [sessao, agora]);

  // Marca a página enquanto o foco está ligado, para os avisos da Repasa ficarem quietos.
  useEffect(() => {
    const html = document.documentElement;
    if (sessao) html.dataset.foco = "ativo";
    else delete html.dataset.foco;
  }, [sessao]);

  const valor: Foco = {
    sessao,
    agora,
    jardim,
    concluida,
    colheita,
    celebrando,
    verArvore: () => setCelebrando(true),
    fecharCelebracao: dispensarConclusao,
    iniciar: (min) => {
      setConcluida(null);
      setCelebrando(false);
      setColheita(null);
      const t = Date.now();
      setAgora(t);
      salvar(novaSessao(min, t));
    },
    pausar: () => sessao && salvar(pausarSessao(sessao, Date.now())),
    retomar: () => {
      if (!sessao) return;
      const t = Date.now();
      setAgora(t);
      salvar(retomarSessao(sessao, t));
    },
    desistir: () => salvar(null),
    dispensarConclusao,
  };

  return <ContextoFoco.Provider value={valor}>{children}</ContextoFoco.Provider>;
}

export function useFoco() {
  const foco = useContext(ContextoFoco);
  if (!foco) throw new Error("useFoco precisa estar dentro do FocoProvider");
  return foco;
}
