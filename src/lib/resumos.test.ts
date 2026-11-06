import { describe, expect, it } from "vitest";
import { linkBibliotecaResumos } from "./atividades/biblioteca";
import { lerVisibilidadeResumo, visibilidadeDoResumo } from "./resumos";

describe("visibilidade do resumo", () => {
  it("converte a escolha do formulário nas colunas do banco e volta igual", () => {
    for (const v of ["rascunho", "turma", "publico"] as const) {
      expect(visibilidadeDoResumo(lerVisibilidadeResumo(v))).toBe(v);
    }
  });

  it("valor desconhecido fica só para a turma", () => {
    expect(lerVisibilidadeResumo("qualquer")).toEqual({ publicado: true, publico: false });
  });

  it("resumos antigos, sem as colunas novas, contam como da turma", () => {
    expect(visibilidadeDoResumo({})).toBe("turma");
  });
});

describe("linkBibliotecaResumos", () => {
  it("leva os filtros para a biblioteca de resumos", () => {
    expect(linkBibliotecaResumos({})).toBe("/biblioteca/resumos");
    expect(linkBibliotecaResumos({ materia: "História", tema: "iluminismo" })).toBe("/biblioteca/resumos?materia=Hist%C3%B3ria&tema=iluminismo");
  });
});
