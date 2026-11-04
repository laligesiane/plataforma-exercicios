import { describe, expect, it } from "vitest";
import { etiquetasDaAtividade } from "./modelo";

describe("etiquetasDaAtividade", () => {
  it("atividade de idioma mostra nível, tema e idioma", () => {
    expect(etiquetasDaAtividade({ materia: "", nivel: "A2", categoria: "gramatica", idioma_ensinado: "es" })).toEqual([
      "A2",
      "Gramática",
      "Espanhol",
    ]);
  });

  it("atividade de outra matéria mostra só a matéria", () => {
    expect(etiquetasDaAtividade({ materia: " Matemática ", nivel: "A1", categoria: "gramatica", idioma_ensinado: null })).toEqual([
      "Matemática",
    ]);
  });
});
