import { describe, expect, it } from "vitest";
import { estadoTrilha } from "./trilha";

const lista = [{ id: "a" }, { id: "b" }, { id: "c" }];

describe("trilha", () => {
  it("abre só a próxima não enviada", () => {
    const r = estadoTrilha(lista, new Set(["a"]), true);
    expect(r.map((x) => x.liberada)).toEqual([true, true, false]);
  });
  it("enviadas continuam abertas mesmo depois de uma pendente", () => {
    const r = estadoTrilha(lista, new Set(["c"]), true);
    expect(r.map((x) => x.liberada)).toEqual([true, false, true]);
  });
  it("desligada, tudo aberto", () => {
    expect(estadoTrilha(lista, new Set(), false).every((x) => x.liberada)).toBe(true);
  });
});
