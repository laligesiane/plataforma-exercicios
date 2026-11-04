import { describe, expect, it } from "vitest";
import { dataValida, formatarData, hojeNoFuso, tituloAula, ultimaAula } from ".";

describe("aulas", () => {
  it("formata a data em português sem trocar o dia", () => {
    expect(formatarData("2026-11-10")).toBe("terça-feira, 10 de novembro");
  });

  it("hoje usa o fuso de São Paulo", () => {
    // 02:00 UTC do dia 5 ainda é dia 4 em São Paulo.
    expect(hojeNoFuso("America/Sao_Paulo", new Date("2026-11-05T02:00:00Z"))).toBe("2026-11-04");
  });

  it("última aula ignora aulas futuras", () => {
    const aulas = [{ data: "2026-11-02" }, { data: "2026-11-09" }, { data: "2026-10-26" }];
    expect(ultimaAula(aulas, "2026-11-04")).toEqual({ data: "2026-11-02" });
    expect(ultimaAula(aulas, "2026-11-09")).toEqual({ data: "2026-11-09" });
    expect(ultimaAula([{ data: "2026-12-01" }], "2026-11-04")).toBeNull();
  });

  it("título padrão usa a data", () => {
    expect(tituloAula({ titulo: "  ", data: "2026-11-10" })).toBe("Aula de terça-feira, 10 de novembro");
    expect(tituloAula({ titulo: "Pretérito imperfeito", data: "2026-11-10" })).toBe("Pretérito imperfeito");
  });

  it("valida datas", () => {
    expect(dataValida("2026-02-29")).toBe(false);
    expect(dataValida("2028-02-29")).toBe(true);
    expect(dataValida("10/11/2026")).toBe(false);
  });
});
