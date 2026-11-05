import { describe, expect, it } from "vitest";
import { esconderTermo, rodadaDeCartoes, totalDeRodadas, type Cartao } from "./cartoes";
import { cartoesParaCompletar, montarComplete, montarLigar, montarMemoria, montarQuiz, montarVerdadeiroFalso, resumir } from "./jogos";

const cartao = (i: number, tipo: Cartao["tipo"] = "negrito"): Cartao => ({
  id: `c${i}`,
  frente: `termo${i}`,
  verso: tipo === "negrito" ? `A frase com termo${i} no meio.` : `Explicação do título ${i}.`,
  tipo,
});
const muitos = [...Array.from({ length: 8 }, (_, i) => cartao(i, "titulo")), ...Array.from({ length: 15 }, (_, i) => cartao(i + 8))];

describe("rodadas de no máximo 10 cartões", () => {
  it("nunca passa de 10 e mistura títulos e negritos", () => {
    const r = rodadaDeCartoes(muitos);
    expect(r).toHaveLength(10);
    expect(r.filter((c) => c.tipo === "titulo").length).toBe(5);
    expect(totalDeRodadas(muitos)).toBe(3);
  });

  it("a próxima rodada traz cartões que ainda não apareceram", () => {
    const primeira = new Set(rodadaDeCartoes(muitos, 0).map((c) => c.id));
    const segunda = rodadaDeCartoes(muitos, 1);
    expect(segunda.every((c) => !primeira.has(c.id))).toBe(true);
  });

  it("com poucos cartões, usa todos", () => {
    expect(rodadaDeCartoes(muitos.slice(0, 4))).toHaveLength(4);
  });
});

describe("pistas sem entregar a resposta", () => {
  it("esconde o termo na frase", () => {
    expect(esconderTermo({ frente: "Pretérito", verso: "O pretérito indica passado." })).toBe("O ____ indica passado.");
  });
  it("aceita termos com caracteres especiais", () => {
    expect(esconderTermo({ frente: "C++ (linguagem)", verso: "Usa C++ (linguagem) aqui." })).toBe("Usa ____ aqui.");
  });
  it("resumir corta em palavra inteira", () => {
    expect(resumir("uma frase bem comprida para cortar", 15)).toBe("uma frase bem…");
  });
});

describe("jogos", () => {
  const rodada = rodadaDeCartoes(muitos);

  it("memória: 6 pares, cada termo com sua explicação", () => {
    const pecas = montarMemoria(rodada, "s");
    expect(pecas).toHaveLength(12);
    for (const p of pecas) expect(pecas.filter((q) => q.par === p.par)).toHaveLength(2);
    expect(pecas.filter((p) => p.lado === "explicacao").every((p) => !/termo\d/.test(p.texto))).toBe(true);
  });

  it("quiz: 4 opções diferentes, uma certa, e mesma montagem para a mesma semente", () => {
    const quiz = montarQuiz(rodada, "s");
    expect(quiz).toHaveLength(10);
    for (const q of quiz) {
      expect(new Set(q.opcoes).size).toBe(4);
      expect(q.opcoes).toContain(q.certa);
      expect(q.enunciado).not.toContain(q.certa);
    }
    expect(montarQuiz(rodada, "s")).toEqual(quiz);
  });

  it("complete: só negritos que estão na frase, com 3 opções", () => {
    const usaveis = cartoesParaCompletar(rodada);
    expect(usaveis.every((c) => c.tipo === "negrito")).toBe(true);
    const perguntas = montarComplete(rodada, "s");
    expect(perguntas).toHaveLength(usaveis.length);
    for (const p of perguntas) {
      expect(p.enunciado).toContain("_____");
      expect(p.opcoes).toHaveLength(3);
    }
  });

  it("verdadeiro ou falso: as falsas usam a explicação de outro cartão", () => {
    const af = montarVerdadeiroFalso(rodada, "s");
    expect(af).toHaveLength(10);
    expect(af.some((a) => a.verdadeira)).toBe(true);
    expect(af.some((a) => !a.verdadeira)).toBe(true);
    for (const a of af) expect(a.explicacao === a.explicacaoCerta).toBe(a.verdadeira);
  });

  it("ligar: telas de até 5 pares, sem tela de um par só", () => {
    expect(montarLigar(rodada, "s").map((t) => t.termos.length)).toEqual([5, 5]);
    expect(montarLigar(rodada.slice(0, 6), "s").map((t) => t.termos.length)).toEqual([6]);
    for (const t of montarLigar(rodada, "s")) {
      expect(new Set(t.explicacoes.map((e) => e.id))).toEqual(new Set(t.termos.map((e) => e.id)));
    }
  });
});
