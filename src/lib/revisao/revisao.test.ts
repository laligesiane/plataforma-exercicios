import { describe, expect, it } from "vitest";
import { avancar, quandoVolta, somarDias } from ".";

describe("revisão espaçada", () => {
  it("soma dias atravessando o mês", () => {
    expect(somarDias("2026-11-29", 3)).toBe("2026-12-02");
  });

  it("errar volta para amanhã, do começo", () => {
    expect(avancar(2, false, "2026-11-05")).toEqual({ etapa: 0, proximaEm: "2026-11-06", concluida: false });
  });

  it("acertar sobe para 3 e depois 7 dias", () => {
    expect(avancar(0, true, "2026-11-05")).toEqual({ etapa: 1, proximaEm: "2026-11-08", concluida: false });
    expect(avancar(1, true, "2026-11-05")).toEqual({ etapa: 2, proximaEm: "2026-11-12", concluida: false });
  });

  it("acertar na última etapa conclui", () => {
    const a = avancar(2, true, "2026-11-05");
    expect(a.concluida).toBe(true);
    expect(quandoVolta(a)).toMatch(/Dominado/);
  });

  it("explica quando o item volta", () => {
    expect(quandoVolta({ etapa: 0, proximaEm: "", concluida: false })).toBe("Volta amanhã.");
    expect(quandoVolta({ etapa: 2, proximaEm: "", concluida: false })).toBe("Volta em 7 dias.");
  });
});
