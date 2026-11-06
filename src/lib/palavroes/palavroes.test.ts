import { describe, expect, it } from "vitest";
import { acharPalavrao, normalizar, textoDoDocumento } from ".";

describe("palavrões", () => {
  it("acha palavrões nos três idiomas", () => {
    expect(acharPalavrao("que porra é essa")).toBe("porra");
    expect(acharPalavrao("¡Qué mierda!")).toBe("mierda");
    expect(acharPalavrao("what the fuck")).toBe("fuck");
  });

  it("pega acento, maiúscula, número no lugar de letra e letra repetida", () => {
    expect(acharPalavrao("CARALHOOOO")).toBe("CARALHOOOO");
    expect(acharPalavrao("p0rr4")).toBe("p0rr4");
    expect(acharPalavrao("Coño")).toBe("Coño");
    expect(acharPalavrao("cabrón")).toBe("cabrón");
    expect(acharPalavrao("sh1t")).toBe("sh1t");
  });

  it("pega plural, raiz e palavra soletrada", () => {
    expect(acharPalavrao("umas putas")).toBe("putas");
    expect(acharPalavrao("bitches")).toBe("bitches");
    expect(acharPalavrao("fuckface")).toBe("fuckface");
    expect(acharPalavrao("foda-se")).toBe("foda-se");
    expect(acharPalavrao("p u t a")).toBe("p u t a");
    expect(acharPalavrao("m.e.r.d.a")).toBe("m e r d a");
  });

  it("não barra palavra comum que contém um palavrão", () => {
    for (const texto of [
      "O computador da escola",
      "Disputa e reputação",
      "Cucumber, shiitake e cocktail",
      "Escuta o áudio",
      "Class, assignment, Scunthorpe",
      "Pica-pau, pinto e piranha são animais",
      "Lição de casa: cubo e cúbico",
      "Vamos repasar los verbos",
      "Hablar, cultura, culinária",
    ]) {
      expect(acharPalavrao(texto), texto).toBeNull();
    }
  });

  it("aceita texto vazio", () => {
    expect(acharPalavrao("")).toBeNull();
    expect(acharPalavrao(null)).toBeNull();
  });

  it("normaliza", () => {
    expect(normalizar("Pórrrraaa")).toBe("pora");
  });

  it("junta o texto de um resumo", () => {
    const doc = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Olá" }, { type: "text", text: "merda" }] }] };
    expect(acharPalavrao(textoDoDocumento(doc))).toBe("merda");
  });
});
