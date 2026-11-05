// Sons de acerto e de erro nas atividades. Feitos na hora com a Web Audio API:
// nenhum arquivo para baixar, nada enviado. O aluno pode silenciar; a escolha fica no aparelho.

const CHAVE = "repasa:sons";
const EVENTO = "repasa:sons";

export function sonsLigados(): boolean {
  try {
    return localStorage.getItem(CHAVE) !== "0";
  } catch {
    return true;
  }
}

export function ligarSons(ligado: boolean) {
  try {
    localStorage.setItem(CHAVE, ligado ? "1" : "0");
  } catch {
    // Sem armazenamento: vale só até recarregar.
  }
  window.dispatchEvent(new CustomEvent(EVENTO, { detail: ligado }));
}

export const EVENTO_SONS = EVENTO;

let contexto: AudioContext | null = null;
function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  contexto ??= new Ctx();
  if (contexto.state === "suspended") void contexto.resume();
  return contexto;
}

type Nota = { freq: number; inicio: number; duracao: number; volume: number; forma: OscillatorType };

function tocar(notas: Nota[]) {
  const ctx = audio();
  if (!ctx) return;
  const agora = ctx.currentTime + 0.01;
  for (const n of notas) {
    const osc = ctx.createOscillator();
    const ganho = ctx.createGain();
    osc.type = n.forma;
    osc.frequency.setValueAtTime(n.freq, agora + n.inicio);
    // Ataque rápido e saída suave, para soar como um "plim" e não como um bipe.
    ganho.gain.setValueAtTime(0.0001, agora + n.inicio);
    ganho.gain.exponentialRampToValueAtTime(n.volume, agora + n.inicio + 0.015);
    ganho.gain.exponentialRampToValueAtTime(0.0001, agora + n.inicio + n.duracao);
    osc.connect(ganho).connect(ctx.destination);
    osc.start(agora + n.inicio);
    osc.stop(agora + n.inicio + n.duracao + 0.05);
  }
}

/** Duas notas subindo, curtas e alegres. */
export function somDeAcerto() {
  tocar([
    { freq: 784, inicio: 0, duracao: 0.16, volume: 0.18, forma: "sine" }, // sol
    { freq: 1175, inicio: 0.09, duracao: 0.32, volume: 0.16, forma: "sine" }, // ré, uma quinta acima
    { freq: 2350, inicio: 0.09, duracao: 0.2, volume: 0.03, forma: "sine" }, // brilho
  ]);
}

/** Duas notas descendo, graves e baixinhas: avisa sem dar bronca. */
export function somDeErro() {
  tocar([
    { freq: 330, inicio: 0, duracao: 0.18, volume: 0.14, forma: "triangle" },
    { freq: 247, inicio: 0.13, duracao: 0.3, volume: 0.13, forma: "triangle" },
  ]);
}

// Um exercício de arrastar corrige vários itens de uma vez: junta tudo num som só
// (o de erro, se algum estiver errado).
let pendente: { errou: boolean; timer: ReturnType<typeof setTimeout> } | null = null;

export function tocarResultado(acertou: boolean) {
  if (!sonsLigados()) return;
  if (pendente) {
    pendente.errou ||= !acertou;
    return;
  }
  pendente = {
    errou: !acertou,
    timer: setTimeout(() => {
      const errou = pendente?.errou;
      pendente = null;
      if (errou) somDeErro();
      else somDeAcerto();
    }, 40),
  };
}
