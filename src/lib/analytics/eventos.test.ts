import { describe, expect, it } from "vitest";
import { gravarFila, lerFila } from "./eventos";

describe("fila de eventos do Analytics", () => {
  it("ida e volta pelo cookie", () => {
    const fila = [{ n: "login" as const, p: { method: "senha" } }, { n: "resumo_criado" as const }];
    expect(lerFila(gravarFila(fila))).toEqual(fila);
  });

  it("ignora cookie vazio ou estragado", () => {
    expect(lerFila(undefined)).toEqual([]);
    expect(lerFila("%%%")).toEqual([]);
    expect(lerFila(encodeURIComponent('{"n":"login"}'))).toEqual([]);
  });

  it("guarda no máximo 10 eventos", () => {
    const muitos = Array.from({ length: 15 }, () => ({ n: "jogo_concluido" as const }));
    expect(lerFila(gravarFila(muitos))).toHaveLength(10);
  });
});
