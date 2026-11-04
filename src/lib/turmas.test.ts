import { describe, expect, it } from "vitest";
import { descreverTurma } from "./turmas";

describe("descreverTurma", () => {
  it("usa a matéria quando há", () => {
    expect(descreverTurma({ materia: " Matemática ", idioma_ensinado: null, idioma_instrucao: null })).toBe("Matemática");
  });
  it("descreve turmas de idioma", () => {
    expect(descreverTurma({ materia: "", idioma_ensinado: "es", idioma_instrucao: "pt" })).toBe(
      "Espanhol explicado em português",
    );
  });
  it("turma antiga sem matéria continua igual", () => {
    expect(descreverTurma({ idioma_ensinado: "en", idioma_instrucao: "es" })).toBe("Inglês explicado em espanhol");
  });
});
