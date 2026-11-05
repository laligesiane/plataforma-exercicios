import { describe, expect, it } from "vitest";
import type { Exercicio } from "./modelo";
import { proximoPendente } from "./proximo";

const lacuna = (id: string, itens: string[]) =>
  ({ id, tipo: "lacuna", titulo: "", instrucoes: "", itens: itens.map((i) => ({ id: i })) }) as unknown as Exercicio;
const kahoot = { id: "k", tipo: "kahoot", titulo: "", instrucoes: "", link: "", itens: [] } as unknown as Exercicio;

describe("proximoPendente", () => {
  it("acha o primeiro exercício com item sem resposta, pulando o Kahoot", () => {
    expect(proximoPendente([kahoot, lacuna("a", ["1", "2"]), lacuna("b", ["3"])], { "1": true, "2": false })).toBe("b");
  });
  it("devolve null quando tudo foi respondido, mesmo com erro", () => {
    expect(proximoPendente([lacuna("a", ["1"])], { "1": false })).toBeNull();
  });
});
