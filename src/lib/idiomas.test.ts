import { describe, expect, it } from "vitest";
import { idiomaNaMateria } from "./idiomas";

describe("idiomaNaMateria", () => {
  it("reconhece o nome de um idioma digitado como matéria", () => {
    expect(idiomaNaMateria("Inglês")).toBe("en");
    expect(idiomaNaMateria("ingles 9º ano")).toBe("en");
    expect(idiomaNaMateria("Espanhol - básico")).toBe("es");
    expect(idiomaNaMateria("  Francês")).toBe("fr");
  });

  it("deixa as outras matérias e o português em paz", () => {
    expect(idiomaNaMateria("Matemática")).toBeNull();
    expect(idiomaNaMateria("Português")).toBeNull();
    expect(idiomaNaMateria("Literatura inglesa")).toBeNull();
    expect(idiomaNaMateria("")).toBeNull();
  });
});
