import { describe, expect, it } from "vitest";
import { ehExercicio, problemasDaAtividade } from "../atividades/modelo";
import { corrigir } from "../correcao";
import type { Cartao } from "../documento/cartoes";
import { juntarCartoes, montarAtividadeSemIa, tiposPossiveis } from "./semIa";

const cartao = (i: number, tipo: Cartao["tipo"] = "definicao"): Cartao => ({
  id: `c${i}`,
  frente: `termo${i}`,
  verso: tipo === "titulo" ? `Explicação do título ${i}.` : `Coisa número ${i} com termo${i} citado.`,
  tipo,
  ...(tipo === "titulo" ? {} : { frase: `O termo${i} é a coisa número ${i}.` }),
});
const muitos = [...Array.from({ length: 6 }, (_, i) => cartao(i, "titulo")), ...Array.from({ length: 14 }, (_, i) => cartao(i + 6))];
const todos = ["quiz", "verdadeiro-falso", "complete", "ligar"] as const;

describe("atividade dos resumos sem IA", () => {
  it("monta um exercício válido de cada tipo, que passa na checagem do editor", () => {
    const ex = montarAtividadeSemIa(muitos, { tipos: [...todos], quantidade: 5, semente: "s" });
    expect(ex.map((e) => e.tipo)).toEqual(["multipla_escolha", "multipla_escolha", "multipla_escolha", "relacionar"]);
    expect(ex.every(ehExercicio)).toBe(true);
    expect(problemasDaAtividade("Atividade", ex)).toEqual([]);
    expect(ex.every((e) => e.itens.length === 5)).toBe(true);
  });

  it("nunca passa de 10 perguntas por exercício", () => {
    const ex = montarAtividadeSemIa(muitos, { tipos: ["quiz"], quantidade: 50, semente: "s" });
    expect(ex[0].itens).toHaveLength(10);
  });

  it("verdadeiro ou falso usa os botões Verdadeiro e Falso e explica o porquê", () => {
    const [vf] = montarAtividadeSemIa(muitos, { tipos: ["verdadeiro-falso"], quantidade: 8, semente: "x" });
    if (vf.tipo !== "multipla_escolha") throw new Error("tipo");
    for (const item of vf.itens) {
      expect(item.alternativas.map((a) => a.texto)).toEqual(["Verdadeiro", "Falso"]);
      const errada = item.alternativas.find((a) => !a.correta)!;
      const r = corrigir(item, errada.id);
      expect(r.status).toBe("errado");
      expect(r.status === "errado" && r.explicacao).toMatch(/^É (verdadeiro|falso)\./);
    }
  });

  it("errar no quiz mostra a resposta certa e a explicação do resumo", () => {
    const [quiz] = montarAtividadeSemIa(muitos, { tipos: ["quiz"], quantidade: 3, semente: "q" });
    if (quiz.tipo !== "multipla_escolha") throw new Error("tipo");
    const item = quiz.itens[0];
    const errada = item.alternativas.find((a) => !a.correta)!;
    const certa = item.alternativas.find((a) => a.correta)!;
    const r = corrigir(item, errada.id);
    expect(r.status === "errado" && r.explicacao).toContain(`A resposta certa é "${certa.texto}"`);
  });

  it("deixa de fora os tipos sem cartões suficientes", () => {
    const poucos = [cartao(1), cartao(2)];
    expect(tiposPossiveis(poucos)).toEqual(["verdadeiro-falso", "complete"]);
    expect(montarAtividadeSemIa(poucos, { tipos: ["quiz", "ligar"], quantidade: 5, semente: "s" })).toEqual([]);
  });

  it("junta cartões de vários resumos sem repetir termo", () => {
    const juntos = juntarCartoes([[cartao(1), cartao(2)], [cartao(2), cartao(3)]]);
    expect(juntos.map((c) => c.frente)).toEqual(["termo1", "termo2", "termo3"]);
    expect(new Set(juntos.map((c) => c.id)).size).toBe(3);
  });
});
