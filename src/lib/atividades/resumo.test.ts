import { describe, expect, it } from "vitest";
import type { Exercicio } from "./modelo";
import { resumirAtividade, textoDoItem } from "./resumo";

const exercicios: Exercicio[] = [
  {
    id: "e1",
    tipo: "lacuna",
    titulo: "Complete",
    instrucoes: "",
    itens: [
      { id: "a", tipo: "lacuna", enunciado: "Yo ___ al parque.", aceitas: ["iba"], errosPrevistos: [], explicacaoPadrao: "x", grafiaExata: false },
      { id: "b", tipo: "lacuna", enunciado: "Vivo ___ Madrid.", aceitas: ["en"], errosPrevistos: [], explicacaoPadrao: "x", grafiaExata: false },
    ],
  },
  {
    id: "e2",
    tipo: "relacionar",
    titulo: "Relacione",
    instrucoes: "",
    itens: [
      { id: "c", tipo: "relacionar", esquerda: "perro", direita: "cachorro", explicacao: "x" },
      { id: "d", tipo: "relacionar", esquerda: "taza", direita: "xícara", explicacao: "x" },
    ],
  },
];

describe("resumirAtividade", () => {
  it("conta certos pela última tentativa, acertos de primeira e itens sem resposta", () => {
    const resumo = resumirAtividade(exercicios, { a: true, b: false, c: true }, { a: true, b: false, c: false });
    expect(resumo).toMatchObject({ total: 4, respondidos: 3, certos: 2, dePrimeira: 1, semResposta: 1 });
    expect(resumo.porExercicio.map((e) => [e.numero, e.certos, e.total])).toEqual([
      [1, 1, 2],
      [2, 1, 2],
    ]);
    expect(resumo.errados).toEqual([{ itemId: "b", exercicio: 1, texto: "Vivo ___ Madrid." }]);
  });

  it("atividade sem respostas", () => {
    expect(resumirAtividade(exercicios, {}, {})).toMatchObject({ respondidos: 0, certos: 0, semResposta: 4 });
  });

  it("textoDoItem mostra o par no relacionar", () => {
    expect(textoDoItem(exercicios[1].itens[0])).toBe("perro → cachorro");
  });
});
