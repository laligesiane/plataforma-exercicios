import { describe, expect, it } from "vitest";
import { converterExercicio } from "./converter";
import type { Exercicio } from "./modelo";

const lacuna: Exercicio = {
  id: "e1",
  tipo: "lacuna",
  titulo: "Pretérito",
  instrucoes: "",
  itens: [
    {
      id: "i1",
      tipo: "lacuna",
      enunciado: "Cuando era niño, ___ al parque.",
      aceitas: ["iba"],
      errosPrevistos: [{ valor: "fui", explicacao: "Hábito pede imperfeito." }],
      explicacaoPadrao: "Use o imperfeito.",
      grafiaExata: false,
    },
    { id: "i2", tipo: "lacuna", enunciado: "Ayer ___ al cine.", aceitas: ["fui"], errosPrevistos: [], explicacaoPadrao: "", grafiaExata: false },
    { id: "i3", tipo: "lacuna", enunciado: "", aceitas: [""], errosPrevistos: [], explicacaoPadrao: "", grafiaExata: false },
  ],
};

describe("trocar o tipo do exercício", () => {
  it("lacuna vira arrastar com a mesma resposta e erros", () => {
    const novo = converterExercicio(lacuna, "arrastar", "s");
    expect(novo?.tipo).toBe("arrastar");
    expect(novo?.id).not.toBe("e1");
    expect(novo?.itens).toHaveLength(2); // o item vazio fica de fora
    expect(novo?.itens[0]).toMatchObject({ resposta: "iba", errosPrevistos: [{ valor: "fui" }] });
  });

  it("na múltipla escolha, o erro previsto vira alternativa com explicação", () => {
    const novo = converterExercicio(lacuna, "multipla_escolha", "s");
    if (novo?.tipo !== "multipla_escolha") throw new Error("tipo");
    const alt = novo.itens[0].alternativas;
    expect(alt.find((a) => a.correta)?.texto).toBe("iba");
    expect(alt.find((a) => a.texto === "fui")).toMatchObject({ correta: false, explicacao: "Hábito pede imperfeito." });
    // Sem erros previstos, a resposta de outro item entra como alternativa errada.
    expect(novo.itens[1].alternativas.map((a) => a.texto).sort()).toEqual(["fui", "iba"]);
  });

  it("múltipla escolha volta a lacuna com as erradas como erros previstos", () => {
    const multipla = converterExercicio(lacuna, "multipla_escolha", "s")!;
    const volta = converterExercicio(multipla, "lacuna", "s");
    if (volta?.tipo !== "lacuna") throw new Error("tipo");
    expect(volta.itens[0].aceitas).toEqual(["iba"]);
    expect(volta.itens[0].errosPrevistos.map((e) => e.valor)).toContain("fui");
  });

  it("recusa conversões sem sentido", () => {
    expect(converterExercicio(lacuna, "classificar")).toBeNull();
  });
});
