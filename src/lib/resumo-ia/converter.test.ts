import { describe, expect, it } from "vitest";
import { textoDoDocumento } from "../documento";
import { cartoesDoDocumento } from "../documento/cartoes";
import { blocosParaDocumento, textoComMarcas } from "./converter";

describe("textoComMarcas", () => {
  it("lê negrito, marca-texto e itálico", () => {
    expect(textoComMarcas("A **mitocôndria** faz ==energia== para a *célula*.")).toEqual([
      { type: "text", text: "A " },
      { type: "text", text: "mitocôndria", marks: [{ type: "bold" }] },
      { type: "text", text: " faz " },
      { type: "text", text: "energia", marks: [{ type: "highlight" }] },
      { type: "text", text: " para a " },
      { type: "text", text: "célula", marks: [{ type: "italic" }] },
      { type: "text", text: "." },
    ]);
  });

  it("não confunde asterisco solto com itálico", () => {
    expect(textoComMarcas("2 * 3 = 6")).toEqual([{ type: "text", text: "2 * 3 = 6" }]);
  });
});

describe("blocosParaDocumento", () => {
  it("monta títulos, listas e notas", () => {
    const doc = blocosParaDocumento([
      { tipo: "titulo", texto: "## Fotossíntese", itens: [] },
      { tipo: "paragrafo", texto: "Processo das plantas.", itens: [] },
      { tipo: "subtitulo", texto: "Etapas", itens: [] },
      { tipo: "lista_numerada", texto: "", itens: ["1. **Fase clara**: usa luz.", "Fase escura"] },
      { tipo: "nota", texto: "Cai muito na prova.", itens: [] },
      { tipo: "lista", texto: "", itens: [] },
    ])!;
    expect(doc.content.map((n) => n.type)).toEqual(["heading", "paragraph", "heading", "orderedList", "blockquote"]);
    expect(doc.content[0]).toEqual({ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Fotossíntese" }] });
    expect(textoDoDocumento(doc)).toContain("Fase clara: usa luz.");
  });

  it("devolve null sem conteúdo", () => {
    expect(blocosParaDocumento([])).toBeNull();
    expect(blocosParaDocumento("x")).toBeNull();
  });

  it("termos em negrito no começo viram cartões de estudo", () => {
    const doc = blocosParaDocumento([
      { tipo: "titulo", texto: "Células", itens: [] },
      {
        tipo: "lista",
        texto: "",
        itens: ["**Mitocôndria**: produz a energia da célula.", "**Ribossomo**: fabrica as proteínas."],
      },
    ])!;
    expect(cartoesDoDocumento(doc).length).toBeGreaterThanOrEqual(2);
  });
});
