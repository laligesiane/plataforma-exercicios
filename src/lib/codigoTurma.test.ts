import { describe, expect, it } from "vitest";
import { formatarCodigo, normalizarCodigo } from "./codigoTurma";

describe("código da turma", () => {
  it("aceita minúsculas, espaços e traço", () => {
    expect(normalizarCodigo(" q2q-zq5 ")).toBe("Q2QZQ5");
  });
  it("recusa tamanho errado e letras ambíguas", () => {
    expect(normalizarCodigo("ABC")).toBeNull();
    expect(normalizarCodigo("ABCDE0")).toBeNull();
  });
  it("formata em dois blocos", () => {
    expect(formatarCodigo("Q2QZQ5")).toBe("Q2Q ZQ5");
  });
});
