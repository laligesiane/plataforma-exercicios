import { describe, expect, it } from "vitest";
import { corrigir, podeVerResposta, respostaCorreta } from "./corrigir";
import type { ItemLacuna, ItemMultiplaEscolha } from "./tipos";

const iba: ItemLacuna = {
  tipo: "lacuna",
  enunciado: "Cuando era niño, ___ al parque todos los días.",
  aceitas: ["iba"],
  errosPrevistos: [
    { valor: "fui", explicacao: "É uma ação habitual no passado, então pede pretérito imperfeito (iba), não indefinido (fui)." },
    { valor: "voy", explicacao: "'Cuando era niño' situa a frase no passado; o presente não serve aqui." },
  ],
  explicacaoPadrao: "Para hábitos no passado, use o pretérito imperfeito: iba, comía, jugaba.",
  grafiaExata: false,
};

const arcoIris = (grafiaExata: boolean): ItemLacuna => ({
  tipo: "lacuna",
  enunciado: "Depois da chuva apareceu um ___.",
  aceitas: ["arco-íris"],
  errosPrevistos: [],
  explicacaoPadrao: "A palavra é arco-íris.",
  grafiaExata,
});

describe("lacuna", () => {
  it("aceita a resposta certa ignorando maiúsculas e espaços", () => {
    expect(corrigir(iba, "  IBA ")).toEqual({ status: "certo" });
  });

  it("explica o erro previsto", () => {
    expect(corrigir(iba, "fui")).toEqual({ status: "errado", explicacao: iba.errosPrevistos[0].explicacao });
  });

  it("reconhece erro previsto mesmo com acento inventado", () => {
    expect(corrigir(iba, "fuí")).toEqual({ status: "errado", explicacao: iba.errosPrevistos[0].explicacao });
  });

  it("usa a explicação padrão quando nada bate", () => {
    expect(corrigir(iba, "andaba")).toEqual({ status: "errado", explicacao: iba.explicacaoPadrao });
  });

  it("resposta vazia é errada", () => {
    expect(corrigir(iba, "   ").status).toBe("errado");
  });

  describe("grafia exata desmarcada", () => {
    it.each(["arco iris", "arcoiris", "Arco-iris", "arco íris"])("'%s' é certo com aviso", (resposta) => {
      expect(corrigir(arcoIris(false), resposta)).toEqual({
        status: "certo_com_aviso",
        aviso: 'A grafia correta é "arco-íris".',
      });
    });

    it("a grafia exata é certo sem aviso", () => {
      expect(corrigir(arcoIris(false), "arco-íris")).toEqual({ status: "certo" });
    });
  });

  describe("grafia exata marcada", () => {
    it("'arco iris' é erro com aviso", () => {
      expect(corrigir(arcoIris(true), "arco iris")).toMatchObject({ status: "errado", aviso: 'A grafia correta é "arco-íris".' });
    });

    it("a grafia exata continua certa", () => {
      expect(corrigir(arcoIris(true), "Arco-Íris")).toEqual({ status: "certo" });
    });
  });
});

const preposicao: ItemMultiplaEscolha = {
  tipo: "multipla_escolha",
  enunciado: "Vivo ___ Madrid.",
  alternativas: [
    { id: "a", texto: "a", correta: false, explicacao: "'A' indica direção (voy a Madrid). Para onde se vive, use 'en'." },
    { id: "b", texto: "en", correta: true, explicacao: "'En' indica lugar onde se está." },
    { id: "c", texto: "de", correta: false },
  ],
  explicacaoPadrao: "Para lugar onde se está ou se vive, use 'en'.",
};

describe("múltipla escolha", () => {
  it("certa traz a explicação da alternativa", () => {
    expect(corrigir(preposicao, "b")).toEqual({ status: "certo", explicacao: "'En' indica lugar onde se está." });
  });

  it("errada explica aquela alternativa", () => {
    expect(corrigir(preposicao, "a")).toEqual({ status: "errado", explicacao: preposicao.alternativas[0].explicacao });
  });

  it("errada sem explicação própria usa a padrão", () => {
    expect(corrigir(preposicao, "c")).toEqual({ status: "errado", explicacao: preposicao.explicacaoPadrao });
  });
});

describe("ver resposta", () => {
  it("libera depois de 1 erro", () => {
    expect(podeVerResposta(0)).toBe(false);
    expect(podeVerResposta(1)).toBe(true);
  });

  it("mostra a resposta correta", () => {
    expect(respostaCorreta(arcoIris(true))).toBe("arco-íris");
    expect(respostaCorreta(preposicao)).toBe("en");
  });
});
