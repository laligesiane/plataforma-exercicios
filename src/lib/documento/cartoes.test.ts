import { describe, expect, it } from "vitest";
import type { Documento } from ".";
import { cartoesDoDocumento, termoBom } from "./cartoes";

const t = (text: string, negrito = false) => ({ type: "text" as const, text, ...(negrito ? { marks: [{ type: "bold" as const }] } : {}) });
const p = (...content: ReturnType<typeof t>[]) => ({ type: "paragraph" as const, content });

const doc: Documento = {
  type: "doc",
  content: [
    p(t("Introdução sem título.")),
    { type: "heading", attrs: { level: 2 }, content: [t("Pretérito imperfeito")] },
    p(t("Usamos para "), t("hábitos no passado", true), t(".")),
    { type: "bulletList", content: [{ type: "listItem", content: [p(t("iba, comía"))] }] },
    { type: "heading", attrs: { level: 3 }, content: [t("Vazio")] },
    { type: "heading", attrs: { level: 2 }, content: [t("Indefinido:")] },
    p(t("Ação "), t("pontual", true), t(" e terminada.")),
  ],
};

describe("cartões do resumo", () => {
  const cartoes = cartoesDoDocumento(doc);

  it("título vira frente e o texto abaixo vira verso", () => {
    expect(cartoes[0]).toMatchObject({ frente: "Pretérito imperfeito", verso: "Usamos para hábitos no passado.\niba, comía" });
    expect(cartoes.find((c) => c.frente === "Indefinido")?.verso).toBe("Ação pontual e terminada.");
  });

  it("título sem texto embaixo não vira cartão", () => {
    expect(cartoes.some((c) => c.frente === "Vazio")).toBe(false);
  });

  it("negrito vira cartão com a frase", () => {
    expect(cartoes.find((c) => c.frente === "hábitos no passado")?.verso).toBe("Usamos para hábitos no passado.");
    expect(cartoes.find((c) => c.frente === "pontual")).toBeTruthy();
  });

  it("tira a numeração dos títulos", () => {
    const numerado: Documento = {
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 2 }, content: [t("2. Aprendizado de máquina")] },
        p(t("Parte de exemplos.")),
        { type: "heading", attrs: { level: 2 }, content: [t("Civil: regras")] },
        p(t("Normas da vida privada.")),
        { type: "heading", attrs: { level: 3 }, content: [t("2.1) Indução")] },
        p(t("Parte de casos.")),
        { type: "heading", attrs: { level: 3 }, content: [t("III - Dedução")] },
        p(t("Parte da regra.")),
        { type: "heading", attrs: { level: 3 }, content: [t("4 Abdução")] },
        p(t("Parte do efeito.")),
        { type: "heading", attrs: { level: 3 }, content: [t("5G")] },
        p(t("Normas da vida privada.")),
      ],
    };
    expect(cartoesDoDocumento(numerado).map((c) => c.frente)).toEqual(["Aprendizado de máquina", "Civil: regras", "Indução", "Dedução", "Abdução", "5G"]);
  });

  it("descarta negritos fracos e mantém termos de verdade", () => {
    expect(["avaliar", "definir", "não", "de", "mais"].filter(termoBom)).toEqual([]);
    expect(["fotossíntese", "celular", "nuclear", "mulher", "Turing", "IA", "aprendizado de máquina", "osmose"].every(termoBom)).toBe(true);
  });

  it("negrito que abre definição vira termo e explicação; no meio da frase vira lacuna", () => {
    const d: Documento = {
      type: "doc",
      content: [
        p(t("Indução", true), t(" é o raciocínio que vai dos casos à regra. Depois testa.")),
        p(t("A partir dela, o algoritmo cria uma regra capaz de "), t("classificar dados novos", true), t(", que ele não viu.")),
      ],
    };
    const [def, lac] = cartoesDoDocumento(d);
    expect(def).toMatchObject({ tipo: "definicao", frente: "Indução", verso: "O raciocínio que vai dos casos à regra." });
    expect(lac).toMatchObject({ tipo: "lacuna", frente: "classificar dados novos" });
    expect(lac.frase).toContain("classificar dados novos");
  });
});
