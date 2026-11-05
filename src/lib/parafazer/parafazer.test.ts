import { describe, expect, it } from "vitest";
import { montarParaFazer, rotuloPrazo } from ".";

describe("para fazer", () => {
  it("tira o que foi enviado ou feito e ordena pelo prazo", () => {
    const lista = montarParaFazer(
      [
        { id: "a1", titulo: "Sem prazo", prazo: null, turma: "T" },
        { id: "a2", titulo: "Enviada", prazo: "2026-11-06", turma: "T" },
        { id: "a3", titulo: "Prazo longe", prazo: "2026-11-20", turma: "T" },
      ],
      new Set(["a2"]),
      [
        { id: "c1", titulo: "Prova", data: "2026-11-10", feito: false, tipo: "prova", materia: "" },
        { id: "c2", titulo: "Feita", data: "2026-11-07", feito: true, tipo: "tarefa", materia: "" },
      ],
    );
    expect(lista.map((p) => p.titulo)).toEqual(["Prova", "Prazo longe", "Sem prazo"]);
  });

  it("descreve o prazo", () => {
    expect(rotuloPrazo("2026-11-04", "2026-11-05")).toEqual({ texto: "Atrasada", atrasado: true });
    expect(rotuloPrazo("2026-11-05", "2026-11-05")?.texto).toBe("Hoje");
    expect(rotuloPrazo("2026-11-06", "2026-11-05")?.texto).toBe("Amanhã");
    expect(rotuloPrazo("2026-11-12", "2026-11-05")?.texto).toBe("Até 12/11");
    expect(rotuloPrazo(null, "2026-11-05")).toBeNull();
  });
});
