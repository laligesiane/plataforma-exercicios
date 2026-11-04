import { describe, expect, it } from "vitest";
import { ehExercicio, ehLinkKahoot, limparExercicio, novoExercicio, problemasDaAtividade, type ExercicioProducao } from "./modelo";
import { resumirAtividade } from "./resumo";

describe("ehLinkKahoot", () => {
  it.each(["https://kahoot.it/challenge/01234567", "https://create.kahoot.it/details/abc", "https://kahoot.com/x"])("aceita %s", (l) =>
    expect(ehLinkKahoot(l)).toBe(true),
  );
  it.each(["http://kahoot.it/x", "https://kahoot.it.evil.com/x", "https://evilkahoot.it/x", "javascript:alert(1)"])("recusa %s", (l) =>
    expect(ehLinkKahoot(l)).toBe(false),
  );
});

describe("produção e Kahoot", () => {
  it("Kahoot sem itens publica só com link válido", () => {
    const kahoot = { ...novoExercicio("kahoot"), link: " https://kahoot.it/challenge/123 " };
    const limpo = limparExercicio(kahoot);
    expect(limpo).toMatchObject({ tipo: "kahoot", link: "https://kahoot.it/challenge/123", itens: [] });
    expect(problemasDaAtividade("T", [limpo])).toEqual([]);
    expect(problemasDaAtividade("T", [limparExercicio(novoExercicio("kahoot"))])).toEqual([
      "Exercício 1: cole o link do Kahoot (kahoot.it).",
    ]);
    expect(ehExercicio(kahoot)).toBe(true);
    expect(ehExercicio({ ...kahoot, itens: [{ id: "x" }] })).toBe(false);
  });

  it("produção precisa de proposta e valida o modo", () => {
    const producao = novoExercicio("producao") as ExercicioProducao;
    expect(problemasDaAtividade("T", [limparExercicio(producao)])).toEqual([
      "Exercício 1, item 1: escreva o que o aluno deve produzir.",
    ]);
    const pronta = { ...producao, itens: [{ ...producao.itens[0], enunciado: "Grave um áudio.", modo: "oral" as const }] };
    expect(problemasDaAtividade("T", [limparExercicio(pronta)])).toEqual([]);
    expect(ehExercicio(pronta)).toBe(true);
    expect(ehExercicio({ ...pronta, itens: [{ ...pronta.itens[0], modo: "video" }] })).toBe(false);
  });

  it("resumo não conta produção nem Kahoot", () => {
    const lacuna = novoExercicio("lacuna");
    const resumo = resumirAtividade([novoExercicio("producao"), lacuna, novoExercicio("kahoot")], {}, {});
    expect(resumo.total).toBe(1);
    expect(resumo.porExercicio.map((e) => e.numero)).toEqual([2]);
  });
});
