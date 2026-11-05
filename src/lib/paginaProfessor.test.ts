import { describe, expect, it } from "vitest";
import { lerContato, normalizarApelido, problemaDoApelido } from "./paginaProfessor";

describe("página do professor", () => {
  it("normaliza o apelido", () => {
    expect(normalizarApelido("  Ana Lúcia  Prof. ")).toBe("ana-lucia-prof");
    expect(normalizarApelido("--Já!--")).toBe("ja");
  });
  it("valida como o banco", () => {
    expect(problemaDoApelido("ana-lucia")).toBeNull();
    expect(problemaDoApelido("ab")).not.toBeNull();
    expect(problemaDoApelido("ana-")).not.toBeNull();
    expect(problemaDoApelido("admin")).not.toBeNull();
  });
  it("só cria link para e-mail ou https", () => {
    expect(lerContato("ana@x.com")?.href).toBe("mailto:ana@x.com");
    expect(lerContato("https://ana.com.br")).toEqual({ texto: "ana.com.br", href: "https://ana.com.br" });
    expect(lerContato("javascript:alert(1)")?.href).toBeUndefined();
    expect(lerContato("  ")).toBeNull();
  });
});
