import { describe, expect, it } from "vitest";
import { ehErroDeVersao, podeRecarregar } from ".";

describe("ehErroDeVersao", () => {
  it("reconhece arquivos da versão antiga que não carregaram", () => {
    expect(ehErroDeVersao({ name: "ChunkLoadError", message: "Loading chunk 123 failed." })).toBe(true);
    expect(ehErroDeVersao({ message: "Failed to fetch dynamically imported module: /x.js" })).toBe(true);
    expect(ehErroDeVersao({ message: "Importing a module script failed." })).toBe(true);
  });
  it("não confunde com outros erros", () => {
    expect(ehErroDeVersao({ name: "TypeError", message: "Cannot read properties of null" })).toBe(false);
    expect(ehErroDeVersao(null)).toBe(false);
  });
});

describe("podeRecarregar", () => {
  it("recarrega se nunca recarregou ou se já passou um minuto", () => {
    expect(podeRecarregar(null, 1_000_000)).toBe(true);
    expect(podeRecarregar("1000", 1_000_000)).toBe(true);
  });
  it("não recarrega de novo logo em seguida", () => {
    expect(podeRecarregar("990000", 1_000_000)).toBe(false);
  });
});
