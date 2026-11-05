import { describe, expect, it } from "vitest";
import {
  faseDoProgresso,
  formatarTempo,
  lerJardim,
  lerSessao,
  novaSessao,
  pausarSessao,
  plantarArvore,
  progressoDa,
  restanteDa,
  retomarSessao,
  ULTIMA_FASE,
} from ".";

describe("faseDoProgresso", () => {
  it("começa como semente e só vira árvore no fim", () => {
    expect(faseDoProgresso(0)).toBe(0);
    expect(faseDoProgresso(0.19)).toBe(0);
    expect(faseDoProgresso(0.2)).toBe(1);
    expect(faseDoProgresso(0.5)).toBe(2);
    expect(faseDoProgresso(0.99)).toBe(ULTIMA_FASE - 1);
    expect(faseDoProgresso(1)).toBe(ULTIMA_FASE);
  });
  it("aceita valores fora da faixa", () => {
    expect(faseDoProgresso(-1)).toBe(0);
    expect(faseDoProgresso(3)).toBe(ULTIMA_FASE);
  });
});

describe("formatarTempo", () => {
  it("formata minutos e segundos", () => {
    expect(formatarTempo(25 * 60_000)).toBe("25:00");
    expect(formatarTempo(245_000)).toBe("4:05");
    expect(formatarTempo(60 * 60_000)).toBe("1:00:00");
    expect(formatarTempo(-5)).toBe("0:00");
  });
  it("arredonda para cima para não mostrar 0:00 antes do fim", () => {
    expect(formatarTempo(400)).toBe("0:01");
  });
});

describe("jardim", () => {
  it("zera quando muda o dia ou o dado é inválido", () => {
    expect(lerJardim(null, "2026-11-05").arvores).toBe(0);
    expect(lerJardim("{x", "2026-11-05").arvores).toBe(0);
    expect(lerJardim(JSON.stringify({ dia: "2026-11-04", arvores: 3, minutos: 75 }), "2026-11-05").arvores).toBe(0);
    expect(lerJardim(JSON.stringify({ dia: "2026-11-05", arvores: 2, minutos: 50 }), "2026-11-05")).toEqual({ dia: "2026-11-05", arvores: 2, minutos: 50 });
  });
  it("planta uma árvore e soma os minutos", () => {
    const j = plantarArvore({ dia: "2026-11-05", arvores: 1, minutos: 25 }, 45, "2026-11-05");
    expect(j).toEqual({ dia: "2026-11-05", arvores: 2, minutos: 70 });
    expect(plantarArvore(j, 15, "2026-11-06")).toEqual({ dia: "2026-11-06", arvores: 1, minutos: 15 });
  });
});

describe("sessão de foco", () => {
  const t0 = 1_000_000;
  it("conta pelo horário de término, mesmo trocando de página", () => {
    const s = novaSessao(25, t0);
    expect(restanteDa(s, t0 + 60_000)).toBe(24 * 60_000);
    expect(progressoDa(s, t0 + 12.5 * 60_000)).toBeCloseTo(0.5);
    expect(restanteDa(s, t0 + 99 * 60_000)).toBe(0);
  });
  it("pausa e retoma sem perder tempo", () => {
    const pausada = pausarSessao(novaSessao(15, t0), t0 + 5 * 60_000);
    expect(pausada.fimEm).toBeNull();
    expect(restanteDa(pausada, t0 + 60 * 60_000)).toBe(10 * 60_000);
    const retomada = retomarSessao(pausada, t0 + 60 * 60_000);
    expect(restanteDa(retomada, t0 + 61 * 60_000)).toBe(9 * 60_000);
  });
  it("lê só sessões válidas", () => {
    const s = novaSessao(45, t0);
    expect(lerSessao(JSON.stringify(s))).toEqual(s);
    expect(lerSessao(JSON.stringify(pausarSessao(s, t0)))).toEqual(pausarSessao(s, t0));
    expect(lerSessao(null)).toBeNull();
    expect(lerSessao("oi")).toBeNull();
    expect(lerSessao(JSON.stringify({ duracaoMin: 0, fimEm: 1, restanteMs: 1 }))).toBeNull();
  });
});
