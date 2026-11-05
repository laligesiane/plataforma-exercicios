import { describe, expect, it } from "vitest";
import {
  ESPECIES,
  calcularSelos,
  diaValido,
  escolherEspecie,
  maiorSequencia,
  proximaMeta,
  selosNovos,
  sequenciaAtual,
  type ArvoreColhida,
} from "./colecao";

const arv = (dia: string, especie = "brotinho", minutos = 25): ArvoreColhida => ({ dia, especie, minutos });

describe("escolherEspecie", () => {
  it("dá primeiro as espécies que faltam na coleção", () => {
    const tem = ESPECIES.slice(0, -1).map((e) => e.id);
    expect(escolherEspecie(tem, tem[0], () => 0.99)).toBe(ESPECIES.at(-1)!.id);
  });

  it("com a coleção completa, nunca repete a última", () => {
    const todas = ESPECIES.map((e) => e.id);
    for (const s of [0, 0.3, 0.6, 0.999]) expect(escolherEspecie(todas, "cerejeira", () => s)).not.toBe("cerejeira");
  });

  it("árvores seguidas saem diferentes", () => {
    const colecao: string[] = [];
    let ultima: string | null = null;
    for (let i = 0; i < 30; i++) {
      const e = escolherEspecie(colecao, ultima);
      expect(e).not.toBe(ultima);
      colecao.push(e);
      ultima = e;
    }
  });
});

describe("dias seguidos", () => {
  it("conta a maior sequência, atravessando o fim do mês", () => {
    expect(maiorSequencia(["2026-10-30", "2026-10-31", "2026-11-01", "2026-11-01", "2026-11-03"])).toBe(3);
    expect(maiorSequencia([])).toBe(0);
  });

  it("a sequência atual vale até ontem e zera se pulou um dia", () => {
    const dias = ["2026-11-02", "2026-11-03", "2026-11-04"];
    expect(sequenciaAtual(dias, "2026-11-04")).toBe(3);
    expect(sequenciaAtual(dias, "2026-11-05")).toBe(3);
    expect(sequenciaAtual(dias, "2026-11-06")).toBe(0);
  });
});

describe("selos", () => {
  it("3 árvores no mesmo dia dão o Jardim do dia", () => {
    const antes = [arv("2026-11-05"), arv("2026-11-05")];
    const depois = [...antes, arv("2026-11-05", "ipe-roxo")];
    expect(selosNovos(antes, depois).map((s) => s.id)).toEqual(["jardim-do-dia"]);
  });

  it("5 dias seguidos dão a Constância", () => {
    const antes = ["01", "02", "03", "04"].map((d) => arv(`2026-11-${d}`));
    const novos = selosNovos(antes, [...antes, arv("2026-11-05")]).map((s) => s.id);
    expect(novos).toContain("constancia");
  });

  it("a primeira árvore dá o primeiro selo e mostra o progresso dos outros", () => {
    const selos = calcularSelos([arv("2026-11-05")]);
    expect(selos.find((s) => s.id === "primeira")?.conquistado).toBe(true);
    expect(selos.find((s) => s.id === "jardim-do-dia")).toMatchObject({ atual: 1, conquistado: false });
  });
});

describe("proximaMeta", () => {
  it("sugere completar o jardim do dia", () => {
    expect(proximaMeta([arv("2026-11-05")], "2026-11-05")).toBe("Plante mais 2 árvores hoje e ganhe o selo Jardim do dia.");
  });
});

describe("diaValido", () => {
  it("aceita só datas perto de hoje", () => {
    const agora = new Date("2026-11-05T12:00:00Z");
    expect(diaValido("2026-11-05", agora)).toBe(true);
    expect(diaValido("2026-11-04", agora)).toBe(true);
    expect(diaValido("2026-10-01", agora)).toBe(false);
    expect(diaValido("ontem", agora)).toBe(false);
  });
});
