import { describe, expect, it } from "vitest";
import { textoParaFala } from "./Ouvir";

describe("texto para ouvir", () => {
  it("põe a resposta na lacuna quando já se sabe", () => {
    expect(textoParaFala("Cuando era niño, ___ al parque.", "iba")).toBe("Cuando era niño, iba al parque.");
  });
  it("faz uma pausa na lacuna sem resposta", () => {
    expect(textoParaFala("Vivo ___ Madrid.")).toBe("Vivo … Madrid.");
  });
});
