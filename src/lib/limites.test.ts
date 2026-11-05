import { describe, expect, it } from "vitest";
import { chegouAoLimite, limite, mensagemDeLimite } from "./limites";

describe("limites do plano", () => {
  it("com a chave desligada, nada tem limite", () => {
    expect(limite(3)).toBeNull();
    expect(chegouAoLimite(50, 3)).toBe(false);
  });

  it("limite vazio no banco nunca barra", () => {
    expect(chegouAoLimite(1000, null)).toBe(false);
    expect(chegouAoLimite(1000, undefined)).toBe(false);
  });

  it("ainda traduz os erros do banco", () => {
    expect(mensagemDeLimite("limite_materias")).toContain("matérias");
  });
});
