import { describe, expect, it } from "vitest";
import type { Documento, No } from "./index";
import { encurtar, mapaDoDocumento } from "./mapa";

const p = (t: string): No => ({ type: "paragraph", content: [{ type: "text", text: t }] });
const h = (t: string, level: 2 | 3): No => ({ type: "heading", attrs: { level }, content: [{ type: "text", text: t }] });
const lista = (...itens: string[]): No => ({
  type: "bulletList",
  content: itens.map((t) => ({ type: "listItem", content: [p(t)] })),
});
const doc = (...content: No[]): Documento => ({ type: "doc", content });

const textos = (n: { texto: string; filhos: { texto: string; filhos: unknown[] }[] }): unknown => ({
  [n.texto]: n.filhos.map((f) => textos(f as typeof n)),
});

describe("mapaDoDocumento", () => {
  it("seções viram ramos, subseções viram galhos e os pontos viram detalhes", () => {
    const m = mapaDoDocumento(
      doc(
        h("Quando usar", 2),
        lista("Hábitos", "Descrições"),
        h("Formação", 2),
        h("Verbos -AR", 3),
        lista("hablaba"),
        h("Verbos -ER/-IR", 3),
        p("comía, vivía"),
      ),
      "Pretérito imperfeito",
    );
    expect(m.centro).toBe("Pretérito imperfeito");
    expect(m.ramos.map(textos)).toEqual([
      { "Quando usar": [{ Hábitos: [] }, { Descrições: [] }] },
      { Formação: [{ "Verbos -AR": [{ hablaba: [] }] }, { "Verbos -ER/-IR": [{ "comía, vivía": [] }] }] },
    ]);
    expect(m.ramos.map((r) => r.cor)).toEqual(["menta", "azul"]);
  });

  it("um único título com subtítulos vira o centro", () => {
    const m = mapaDoDocumento(doc(h("Resumo de Geometria", 2), p("Panorama"), h("1. Triângulos", 3), lista("Soma 180°")));
    expect(m.centro).toBe("Resumo de Geometria");
    expect(m.ramos.map(textos)).toEqual([{ "1. Triângulos": [{ "Soma 180°": [] }] }]);
  });

  it("sem títulos, cada ponto vira um ramo", () => {
    const m = mapaDoDocumento(doc(p("Um"), lista("Dois", "Três")), "Tema");
    expect(m.ramos.map((r) => r.texto)).toEqual(["Um", "Dois", "Três"]);
  });

  it("respeita os limites do mapa", () => {
    const secoes = Array.from({ length: 10 }, (_, i) => [h(`S${i}`, 2), lista(...Array.from({ length: 12 }, (_, j) => `p${j}`))]).flat();
    const m = mapaDoDocumento(doc(...secoes), "T");
    expect(m.ramos).toHaveLength(8);
    expect(m.ramos[0].filhos).toHaveLength(8);
  });
});

describe("resumo só com Subtítulos (caso do resumo de IA)", () => {
  const t = (text: string, marks?: ("bold" | "italic")[]): No => ({ type: "text", text, marks: marks?.map((type) => ({ type })) });
  const item = (...partes: No[]): No => ({ type: "listItem", content: [{ type: "paragraph", content: partes }] });
  const ia = doc(
    h("1. O que é Inteligência Artificial", 3),
    {
      type: "bulletList",
      content: [
        item(t("A IA pode ser definida como "), t("um ramo da ciência da computação que se ocupa da automação do comportamento inteligente", ["bold"]), t(".")),
        item(t("Complemento:", ["italic"]), t(" essa definição é de George Luger, autor de um dos livros-base da disciplina. A ideia central é outra.")),
      ],
    },
    h("2. Aprendizado de máquina por indução de hipóteses", 3),
    { type: "bulletList", content: [item(t("O aprendizado parte de uma "), t("amostra conhecida", ["bold"]), t(" (conjunto de treinamento)."))] },
    h("3. Aplicações", 3),
    p("Visão computacional."),
  );
  const m = mapaDoDocumento(ia, "Introdução à Inteligência Artificial");

  it("cada Subtítulo vira um ramo, inclusive o primeiro", () => {
    expect(m.centro).toBe("Introdução à Inteligência Artificial");
    expect(m.ramos.map((r) => r.texto)).toEqual([
      "1. O que é Inteligência Artificial",
      "2. Aprendizado de máquina por indução de hipóteses",
      "3. Aplicações",
    ]);
  });

  it("o negrito resume o ponto e o rótulo fica junto do conteúdo", () => {
    const [def, comp] = m.ramos[0].filhos.map((f) => f.texto);
    expect(def.startsWith("Um ramo da ciência da computação")).toBe(true);
    expect(def.length).toBeLessThanOrEqual(80);
    expect(comp.startsWith("Complemento: essa definição é de George Luger")).toBe(true);
    expect(m.ramos[1].filhos[0].texto).toBe("Amostra conhecida");
  });
});

describe("encurtar", () => {
  it("prefere a primeira frase e corta em palavra", () => {
    expect(encurtar("Frase curta. Depois vem um texto bem longo que passaria do limite de oitenta letras com folga.")).toBe(
      "Frase curta.",
    );
    const longo = encurtar("palavra ".repeat(20));
    expect(longo.length).toBeLessThanOrEqual(80);
    expect(longo.endsWith("palavra…")).toBe(true);
  });
});
