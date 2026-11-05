import { describe, expect, it } from "vitest";
import { diasDeEstudo, fraseDoBrotinho, semanaAtual, sequenciaAtual } from ".";

describe("sequência de estudo", () => {
  it("conta o dia no fuso de São Paulo", () => {
    // 01:30 UTC de 05/11 ainda é 04/11 em São Paulo.
    expect([...diasDeEstudo(["2026-11-05T01:30:00Z"])]).toEqual(["2026-11-04"]);
  });

  it("conta dias seguidos, e ontem ainda vale se hoje não estudou", () => {
    const dias = new Set(["2026-11-02", "2026-11-03", "2026-11-04"]);
    expect(sequenciaAtual(dias, "2026-11-04")).toBe(3);
    expect(sequenciaAtual(dias, "2026-11-05")).toBe(3);
    expect(sequenciaAtual(dias, "2026-11-06")).toBe(0);
  });

  it("monta a semana de segunda a domingo", () => {
    const semana = semanaAtual(new Set(["2026-11-03"]), "2026-11-05"); // quinta
    expect(semana[0].data).toBe("2026-11-02");
    expect(semana[6].data).toBe("2026-11-08");
    expect(semana.filter((d) => d.estudou)).toHaveLength(1);
    expect(semana[3]).toMatchObject({ hoje: true, futuro: false });
    expect(semana[4].futuro).toBe(true);
  });

  it("frase muda com a meta", () => {
    expect(fraseDoBrotinho(3, 3, true)).toMatch(/Meta da semana/);
    expect(fraseDoBrotinho(1, 1, true)).toMatch(/Faltam 2 dias/);
  });
});
