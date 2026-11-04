import { describe, expect, it } from "vitest";
import {
  ehExercicio,
  limparExercicio,
  novoExercicio,
  novoItemLacuna,
  problemasDaAtividade,
  type ExercicioLacuna,
  type ExercicioMultiplaEscolha,
} from "./modelo";

function lacunaPronta(): ExercicioLacuna {
  return {
    id: "6f1d2a3b-0000-4000-8000-000000000001",
    tipo: "lacuna",
    titulo: " Complete ",
    instrucoes: "Escreva",
    itens: [
      {
        id: "i1",
        tipo: "lacuna",
        enunciado: " Cuando era niño, ___ al parque. ",
        aceitas: [" iba ", ""],
        errosPrevistos: [{ valor: "fui", explicacao: "Hábito pede imperfeito." }, { valor: " ", explicacao: "" }],
        explicacaoPadrao: "Use o imperfeito.",
        grafiaExata: false,
      },
    ],
  };
}

function multiplaPronta(): ExercicioMultiplaEscolha {
  return {
    id: "6f1d2a3b-0000-4000-8000-000000000002",
    tipo: "multipla_escolha",
    titulo: "Escolha",
    instrucoes: "",
    itens: [
      {
        id: "i2",
        tipo: "multipla_escolha",
        enunciado: "Vivo ___ Madrid.",
        alternativas: [
          { id: "a", texto: "en", correta: true },
          { id: "b", texto: "a", correta: false, explicacao: "  " },
          { id: "c", texto: "", correta: false },
        ],
        explicacaoPadrao: "Lugar onde se está pede en.",
      },
    ],
  };
}

describe("limparExercicio", () => {
  it("tira espaços e linhas vazias da lacuna", () => {
    const limpo = limparExercicio(lacunaPronta()) as ExercicioLacuna;
    expect(limpo.titulo).toBe("Complete");
    expect(limpo.itens[0].enunciado).toBe("Cuando era niño, ___ al parque.");
    expect(limpo.itens[0].aceitas).toEqual(["iba"]);
    expect(limpo.itens[0].errosPrevistos).toEqual([{ valor: "fui", explicacao: "Hábito pede imperfeito." }]);
  });

  it("remove alternativas vazias e explicações em branco", () => {
    const limpo = limparExercicio(multiplaPronta()) as ExercicioMultiplaEscolha;
    expect(limpo.itens[0].alternativas.map((a) => a.id)).toEqual(["a", "b"]);
    expect(limpo.itens[0].alternativas[1]).not.toHaveProperty("explicacao");
  });
});

describe("problemasDaAtividade", () => {
  it("aceita uma atividade completa", () => {
    const exercicios = [lacunaPronta(), multiplaPronta()].map(limparExercicio);
    expect(problemasDaAtividade("Passado", exercicios)).toEqual([]);
  });

  it("pede título e exercício", () => {
    expect(problemasDaAtividade(" ", [])).toEqual(["Dê um título para a atividade.", "Adicione pelo menos um exercício."]);
  });

  it("exige exatamente uma lacuna na frase", () => {
    const ex = lacunaPronta();
    ex.itens[0].enunciado = "Sem lacuna";
    expect(problemasDaAtividade("T", [limparExercicio(ex)])[0]).toContain("exatamente uma lacuna");
    ex.itens[0].enunciado = "___ e ___";
    expect(problemasDaAtividade("T", [limparExercicio(ex)])[0]).toContain("exatamente uma lacuna");
  });

  it("exige resposta e explicação na lacuna", () => {
    const item = { ...novoItemLacuna(), enunciado: "Eu ___." };
    const problemas = problemasDaAtividade("T", [limparExercicio({ ...lacunaPronta(), itens: [item] })]);
    expect(problemas).toEqual([
      "Exercício 1, item 1: escreva a resposta certa.",
      "Exercício 1, item 1: escreva a explicação para quando o aluno errar.",
    ]);
  });

  it("exige uma única alternativa correta", () => {
    const ex = multiplaPronta();
    ex.itens[0].alternativas[1].correta = true;
    expect(problemasDaAtividade("T", [limparExercicio(ex)])).toContain(
      "Exercício 1, item 1: marque exatamente uma alternativa correta.",
    );
  });

  it("aceita alternativas erradas sem explicação quando há explicação geral, e recusa sem nenhuma", () => {
    const ex = multiplaPronta();
    expect(problemasDaAtividade("T", [limparExercicio(ex)])).toEqual([]);
    ex.itens[0].explicacaoPadrao = "";
    expect(problemasDaAtividade("T", [limparExercicio(ex)])[0]).toContain("explique as alternativas erradas");
  });
});

describe("ehExercicio", () => {
  it("reconhece os exercícios de exemplo e os novos dos dois tipos", () => {
    expect(ehExercicio(lacunaPronta())).toBe(true);
    expect(ehExercicio(multiplaPronta())).toBe(true);
    expect(ehExercicio(novoExercicio("lacuna"))).toBe(true);
    expect(ehExercicio(novoExercicio("multipla_escolha"))).toBe(true);
  });

  it("recusa formatos estranhos", () => {
    expect(ehExercicio(null)).toBe(false);
    expect(ehExercicio({ ...novoExercicio("lacuna"), tipo: "outro" })).toBe(false);
    expect(ehExercicio({ ...novoExercicio("lacuna"), itens: [{ tipo: "lacuna" }] })).toBe(false);
    expect(ehExercicio({ ...novoExercicio("lacuna"), id: "1),(id.eq.x" })).toBe(false);
  });
});
