import { describe, expect, it } from "vitest";
import { continuarDeOndeParou } from ".";

const atividades = new Map([
  ["a1", { id: "a1", titulo: "Verbos" }],
  ["a2", { id: "a2", titulo: "Frutas" }],
]);

describe("continuarDeOndeParou", () => {
  it("pula a atividade já enviada e ordena pelo mais recente", () => {
    const r = continuarDeOndeParou(
      [
        { atividade_id: "a1", criada_em: "2026-11-05T10:00:00Z" },
        { atividade_id: "a2", criada_em: "2026-11-04T10:00:00Z" },
      ],
      atividades,
      new Set(["a1"]),
      [{ id: "r1", titulo_exibido: "Revolução", atualizado_em: "2026-11-04T12:00:00Z" }],
    );
    expect(r.map((c) => c.titulo)).toEqual(["Revolução", "Frutas"]);
    expect(r[1].href).toBe("/atividades/a2");
  });
  it("sem nada começado, fica vazio", () => {
    expect(continuarDeOndeParou([], atividades, new Set(), [])).toEqual([]);
  });
});
