import { describe, expect, it } from "vitest";
import { converterGeracao, esquemaDaGeracao } from "./converter";

describe("converterGeracao", () => {
  it("converte e descarta itens com defeito", () => {
    const r = converterGeracao(
      {
        titulo: "Revisão",
        exercicios: [
          {
            tipo: "lacuna",
            titulo: "Complete",
            instrucoes: "Escreva",
            itens: [
              { enunciado: "A capital é ____.", aceitas: ["Brasília"], errosPrevistos: [], explicacaoPadrao: "É Brasília." },
              { enunciado: "Sem lacuna", aceitas: ["x"], errosPrevistos: [], explicacaoPadrao: "x" },
            ],
          },
          {
            tipo: "multipla_escolha",
            titulo: "Escolha",
            instrucoes: "Clique",
            itens: [
              {
                enunciado: "2+2?",
                alternativas: [
                  { texto: "4", correta: true, explicacao: "" },
                  { texto: "5", correta: false, explicacao: "Conta de novo." },
                ],
                explicacaoPadrao: "",
              },
              {
                enunciado: "Duas certas",
                alternativas: [
                  { texto: "a", correta: true, explicacao: "" },
                  { texto: "b", correta: true, explicacao: "" },
                ],
                explicacaoPadrao: "x",
              },
            ],
          },
          { tipo: "producao", titulo: "x", instrucoes: "x", itens: [] },
        ],
      },
      ["lacuna", "multipla_escolha"],
    );
    expect(r.titulo).toBe("Revisão");
    expect(r.exercicios).toHaveLength(2);
    expect(r.exercicios[0].itens).toHaveLength(1);
    expect((r.exercicios[0].itens[0] as { enunciado: string }).enunciado).toBe("A capital é ___.");
    expect(r.exercicios[1].itens).toHaveLength(1);
  });

  it("liga cartões às colunas pelo nome e exige dois pares no relacionar", () => {
    const r = converterGeracao(
      {
        titulo: "",
        exercicios: [
          {
            tipo: "classificar",
            titulo: "Classifique",
            instrucoes: "Arraste",
            colunas: ["Mamíferos", "Aves"],
            itens: [
              { texto: "Cão", coluna: "mamíferos", explicacao: "Mama." },
              { texto: "Pombo", coluna: "Aves", explicacao: "Tem penas." },
              { texto: "Peixe", coluna: "Peixes", explicacao: "?" },
            ],
          },
          {
            tipo: "relacionar",
            titulo: "Relacione",
            instrucoes: "Ligue",
            itens: [{ esquerda: "a", direita: "b", explicacao: "c" }],
          },
        ],
      },
      ["classificar", "relacionar"],
    );
    expect(r.exercicios).toHaveLength(1);
    expect(r.exercicios[0].itens).toHaveLength(2);
  });

  it("monta um esquema com anyOf quando há vários tipos", () => {
    const e = esquemaDaGeracao(["lacuna", "relacionar"]) as unknown as { properties: { exercicios: { items: { anyOf?: unknown[] } } } };
    expect(e.properties.exercicios.items.anyOf).toHaveLength(2);
  });
});
