/** Regras do modo foco: durações, relógio e o jardim do dia (guardado só no navegador). */

export const DURACOES_MIN = [15, 25, 45, 60] as const;
export const DURACAO_PADRAO = 25;

/** "25:00", "4:05" e, acima de uma hora, "1:00:00". */
export function formatarTempo(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
}

export type Jardim = { dia: string; arvores: number; minutos: number };

export const CHAVE_JARDIM = "repasa:jardim";

/** Data local no formato AAAA-MM-DD. */
export function diaLocal(agora = new Date()) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${agora.getFullYear()}-${p(agora.getMonth() + 1)}-${p(agora.getDate())}`;
}

/** Lê o jardim salvo; de outro dia ou inválido, começa vazio. */
export function lerJardim(bruto: string | null, hoje: string): Jardim {
  const vazio = { dia: hoje, arvores: 0, minutos: 0 };
  if (!bruto) return vazio;
  try {
    const j = JSON.parse(bruto) as Partial<Jardim>;
    if (j.dia !== hoje || typeof j.arvores !== "number" || typeof j.minutos !== "number") return vazio;
    return { dia: hoje, arvores: Math.max(0, j.arvores), minutos: Math.max(0, j.minutos) };
  } catch {
    return vazio;
  }
}

export function plantarArvore(jardim: Jardim, minutos: number, hoje: string): Jardim {
  const base = jardim.dia === hoje ? jardim : { dia: hoje, arvores: 0, minutos: 0 };
  return { dia: hoje, arvores: base.arvores + 1, minutos: base.minutos + minutos };
}

/** As fases do Brotinho no modo foco, de semente embaixo da terra até árvore florida. */
export const FASES = [
  { nome: "Semente", frase: "O Brotinho está dormindo embaixo da terra." },
  { nome: "Acordando", frase: "Olha o primeiro broto saindo da terra!" },
  { nome: "Brotinho", frase: "O Brotinho saiu da terra. Continue assim!" },
  { nome: "Plantinha", frase: "Ele está virando uma plantinha." },
  { nome: "Arvorezinha", frase: "Já é uma arvorezinha! Falta pouco." },
  { nome: "Árvore", frase: "Uma árvore florida, fruto do seu estudo!" },
] as const;

export const ULTIMA_FASE = FASES.length - 1;

/** Em que fase a planta está, dado quanto da sessão já passou (0 a 1). A árvore completa só aparece no fim. */
export function faseDoProgresso(progresso: number) {
  if (progresso >= 1) return ULTIMA_FASE;
  return Math.min(ULTIMA_FASE - 1, Math.floor(Math.max(0, progresso) * ULTIMA_FASE));
}
