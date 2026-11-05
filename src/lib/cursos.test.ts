import { describe, expect, it } from "vitest";
import { descreverDuracao, duracaoEmMeses, progressoCurso, somarMeses, tempoEntre } from "./cursos";

const d = (a: number, m: number, dia: number) => new Date(a, m - 1, dia);

describe("duracaoEmMeses", () => {
  it("converte unidades", () => {
    expect(duracaoEmMeses("4", "anos")).toBe(48);
    expect(duracaoEmMeses("8", "semestres")).toBe(48);
    expect(duracaoEmMeses("1,5", "anos")).toBe(18);
    expect(duracaoEmMeses("6", "meses")).toBe(6);
  });
  it("recusa valores ruins", () => {
    expect(duracaoEmMeses("", "anos")).toBeNull();
    expect(duracaoEmMeses("0", "meses")).toBeNull();
    expect(duracaoEmMeses("abc", "meses")).toBeNull();
    expect(duracaoEmMeses("3", "dias")).toBeNull();
    expect(duracaoEmMeses("30", "anos")).toBeNull();
  });
});

describe("descreverDuracao", () => {
  it("usa a unidade mais redonda", () => {
    expect(descreverDuracao(48).texto).toBe("4 anos");
    expect(descreverDuracao(12).texto).toBe("1 ano");
    expect(descreverDuracao(18).texto).toBe("3 semestres");
    expect(descreverDuracao(1).texto).toBe("1 mês");
    expect(descreverDuracao(5).texto).toBe("5 meses");
  });
});

describe("somarMeses", () => {
  it("não pula para o mês seguinte no fim do mês", () => {
    expect(somarMeses(d(2026, 1, 31), 1)).toEqual(d(2026, 2, 28));
    expect(somarMeses(d(2026, 3, 1), 48)).toEqual(d(2030, 3, 1));
  });
});

describe("tempoEntre", () => {
  it("escreve anos, meses e dias", () => {
    expect(tempoEntre(d(2026, 11, 5), d(2029, 2, 5))).toBe("2 anos e 3 meses");
    expect(tempoEntre(d(2026, 11, 5), d(2027, 11, 5))).toBe("1 ano");
    expect(tempoEntre(d(2026, 11, 5), d(2027, 1, 5))).toBe("2 meses");
    expect(tempoEntre(d(2026, 11, 5), d(2026, 11, 17))).toBe("12 dias");
    expect(tempoEntre(d(2026, 11, 5), d(2026, 11, 6))).toBe("1 dia");
  });
});

describe("progressoCurso", () => {
  it("sem início ou duração não tem barra", () => {
    expect(progressoCurso(null, 48)).toBeNull();
    expect(progressoCurso("2026-03-01", null)).toBeNull();
    expect(progressoCurso("março", 12)).toBeNull();
  });
  it("calcula o meio do curso e quanto falta", () => {
    const p = progressoCurso("2025-03-01", 48, d(2027, 3, 1))!;
    expect(p.situacao).toBe("andamento");
    expect(p.fim).toEqual(d(2029, 3, 1));
    expect(p.porcentagem).toBe(50);
    expect(p.falta).toBe("Faltam 2 anos");
  });
  it("antes de começar e depois de terminar", () => {
    expect(progressoCurso("2027-02-01", 12, d(2026, 11, 5))).toMatchObject({ porcentagem: 0, situacao: "nao-comecou", falta: "Começa em 2 meses" });
    expect(progressoCurso("2020-01-01", 12, d(2026, 11, 5))).toMatchObject({ porcentagem: 100, situacao: "terminou" });
  });
});
