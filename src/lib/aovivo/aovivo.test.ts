import { describe, expect, it } from "vitest";
import { painelAoVivo } from ".";

const agora = new Date("2026-11-05T12:00:00Z");
const r = (aluno_id: string, item_id: string, status: string, min: number) => ({
  aluno_id,
  item_id,
  status,
  criada_em: new Date(agora.getTime() - min * 60_000).toISOString(),
});

describe("painelAoVivo", () => {
  const p = painelAoVivo(
    ["a", "b", "c"],
    ["i1", "i2"],
    [r("a", "i1", "errado", 5), r("a", "i1", "certo", 4), r("a", "i2", "certo", 1), r("b", "i1", "errado", 1), r("x", "i1", "certo", 1), r("c", "zz", "certo", 1)],
    agora,
  );
  it("conta acerto de primeira e quem ainda está errando", () => {
    expect(p.porItem[0]).toEqual({ itemId: "i1", responderam: 2, deCara: 0, aindaErrados: ["b"] });
    expect(p.porItem[1]).toEqual({ itemId: "i2", responderam: 1, deCara: 1, aindaErrados: [] });
  });
  it("sabe quem está respondendo agora e quem terminou", () => {
    expect(p.porAluno.map((a) => [a.alunoId, a.respondidos, a.ativo])).toEqual([
      ["a", 2, true],
      ["b", 1, true],
      ["c", 0, false],
    ]);
    expect(p.ativos).toBe(2);
    expect(p.terminaram).toBe(1);
  });
});
