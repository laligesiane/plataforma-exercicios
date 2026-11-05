import { describe, expect, it } from "vitest";
import type { Documento } from ".";
import { cartoesDoDocumento } from "./cartoes";

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
});
