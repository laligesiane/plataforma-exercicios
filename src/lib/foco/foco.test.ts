import { describe, expect, it } from "vitest";
import { faseDoProgresso, formatarTempo, lerJardim, plantarArvore, ULTIMA_FASE } from ".";

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
