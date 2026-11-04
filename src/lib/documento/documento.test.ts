import { describe, expect, it } from "vitest";
import { documentoDeTexto, documentoTemConteudo, secoesDoDocumento, textoDoDocumento, validarDocumento } from "./index";

const doc = {
  type: "doc",
  content: [
    { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Pretérito" }] },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "Usa-se ", marks: [{ type: "bold" }, { type: "link", attrs: { href: "javascript:x" } }] },
        { type: "text", text: "para hábitos", marks: [{ type: "highlight" }] },
      ],
    },
    { type: "heading", attrs: { level: 3 }, content: [{ type: "text", text: "Exemplos" }] },
    { type: "bulletList", content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Yo hablaba" }] }] }] },
    { type: "blockquote", content: [{ type: "paragraph", content: [{ type: "text", text: "Atenção ao acento" }] }] },
    { type: "image", attrs: { src: "x" } },
    { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Fim" }] },
  ],
};

describe("validarDocumento", () => {
  it("recusa o que não é documento", () => {
    expect(validarDocumento(null)).toBeNull();
    expect(validarDocumento({ type: "paragraph" })).toBeNull();
  });

  it("tira nós e marcas desconhecidos e normaliza o nível do título", () => {
    const v = validarDocumento(doc)!;
    expect(v.content.map((n) => n.type)).toEqual(["heading", "paragraph", "heading", "bulletList", "blockquote", "heading"]);
    const p = v.content[1] as { content: { marks?: { type: string }[] }[] };
    expect(p.content[0].marks).toEqual([{ type: "bold" }]);
    expect(v.content[5]).toMatchObject({ attrs: { level: 2 } });
  });

  it("corta textos muito longos", () => {
    const longo = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "a".repeat(30000) }] }] };
    expect(textoDoDocumento(validarDocumento(longo)!).length).toBe(20000);
  });
});

describe("textoDoDocumento e secoesDoDocumento", () => {
  const v = validarDocumento(doc)!;
  it("gera texto corrido", () => {
    expect(textoDoDocumento(v)).toBe("Pretérito\nUsa-se para hábitos\nExemplos\nYo hablaba\nAtenção ao acento\nFim");
  });
  it("lista seções com ids", () => {
    expect(secoesDoDocumento(v)).toEqual([
      { id: "secao-1-preterito", texto: "Pretérito", nivel: 2 },
      { id: "secao-2-exemplos", texto: "Exemplos", nivel: 3 },
      { id: "secao-3-fim", texto: "Fim", nivel: 2 },
    ]);
  });
});

describe("documentoDeTexto", () => {
  it("vira um parágrafo por linha", () => {
    const d = documentoDeTexto("um\n\n dois ");
    expect(textoDoDocumento(d)).toBe("um\ndois");
    expect(documentoTemConteudo(documentoDeTexto(""))).toBe(false);
  });
});
