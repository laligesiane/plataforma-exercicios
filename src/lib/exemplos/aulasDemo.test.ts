import { describe, expect, it } from "vitest";
import { problemasDaAtividade, tiposExercicio } from "../atividades/modelo";
import { ehMidia } from "../atividades/midia";
import { corrigir, respostaCorreta } from "../correcao";
import { aulasDemo } from "./aulasDemo";

describe("aulas de demonstração", () => {
  it.each(aulasDemo.map((a) => [a.materia, a] as const))("%s tem um exercício de cada tipo", (_, aula) => {
    const tipos = new Set(aula.exercicios.map((e) => e.tipo));
    expect([...tipos].sort()).toEqual(Object.keys(tiposExercicio).sort());
  });

  it.each(aulasDemo.map((a) => [a.materia, a] as const))("%s está pronta para publicar", (_, aula) => {
    expect(problemasDaAtividade(aula.titulo, aula.exercicios)).toEqual([]);
    expect(aula.exercicios.some((e) => e.midia && ehMidia(e.midia))).toBe(true);
  });

  it("ids de exercícios e itens não se repetem", () => {
    const ids = aulasDemo.flatMap((a) => a.exercicios.flatMap((e) => [e.id, ...e.itens.map((i) => i.id)]));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("a resposta certa de cada item é corrigida como certa", () => {
    for (const aula of aulasDemo) {
      for (const e of aula.exercicios) {
        if (e.tipo === "producao" || e.tipo === "kahoot") continue;
        for (const item of e.itens) {
          const certa = item.tipo === "multipla_escolha" ? item.alternativas.find((a) => a.correta)!.id : respostaCorreta(item);
          expect(corrigir(item, certa).status, item.id).toBe("certo");
        }
      }
    }
  });

  it("só aceita imagens locais da pasta demo", () => {
    expect(ehMidia({ tipo: "imagem", url: "/demo/pizza.svg" })).toBe(true);
    expect(ehMidia({ tipo: "imagem", url: "/outra/pizza.svg" })).toBe(false);
    expect(ehMidia({ tipo: "imagem", url: "//site.com/demo/x.svg" })).toBe(false);
  });

  it("os erros previstos dão a explicação deles", () => {
    for (const aula of aulasDemo) {
      for (const e of aula.exercicios) {
        if (e.tipo !== "lacuna" && e.tipo !== "arrastar") continue;
        for (const item of e.itens) {
          for (const erro of item.errosPrevistos) {
            const r = corrigir(item, erro.valor);
            expect(r.status, `${item.id} ${erro.valor}`).toBe("errado");
          }
        }
      }
    }
  });
});
