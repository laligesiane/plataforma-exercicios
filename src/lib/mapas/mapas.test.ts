import { describe, expect, it } from "vitest";
import { desenharMapa, mapaEmTopicos, quebrarLinhas, validarMapa, type Caixa, type Mapa } from ".";

const mapa: Mapa = {
  centro: "Pretérito imperfeito",
  ramos: [
    { id: "a", cor: "menta", texto: "Quando usar", filhos: [
      { id: "a1", texto: "Hábitos no passado", filhos: [] },
      { id: "a2", texto: "Descrições", filhos: [] },
    ] },
    { id: "b", cor: "azul", texto: "Terminações", filhos: [
      { id: "b1", texto: "-aba (cantaba)", filhos: [] },
      { id: "b2", texto: "-ía (comía, vivía)", filhos: [] },
    ] },
    { id: "c", cor: "coral", texto: "Irregulares: ser, ir, ver", filhos: [] },
  ],
};

function sobrepoe(a: Caixa, b: Caixa) {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

describe("desenharMapa", () => {
  const d = desenharMapa(mapa);

  it("desenha uma caixa por nó e uma ligação por filho", () => {
    expect(d.caixas).toHaveLength(8);
    expect(d.ligacoes).toHaveLength(7);
  });

  it("nenhuma caixa encosta em outra", () => {
    for (let i = 0; i < d.caixas.length; i++)
      for (let j = i + 1; j < d.caixas.length; j++) expect(sobrepoe(d.caixas[i], d.caixas[j])).toBe(false);
  });

  it("divide os ramos entre os dois lados do centro", () => {
    const centro = d.caixas.find((c) => c.id === "centro")!;
    const a = d.caixas.find((c) => c.id === "a")!;
    const c = d.caixas.find((c) => c.id === "c")!;
    expect(a.x).toBeGreaterThan(centro.x + centro.w);
    expect(c.x + c.w).toBeLessThan(centro.x);
  });

  it("filhos herdam a cor do ramo e tudo cabe no quadro", () => {
    expect(d.caixas.find((c) => c.id === "b2")!.cor).toBe("azul");
    for (const c of d.caixas) {
      expect(c.x).toBeGreaterThanOrEqual(0);
      expect(c.y + c.h).toBeLessThanOrEqual(d.altura);
      expect(c.x + c.w).toBeLessThanOrEqual(d.largura);
    }
  });

  it("um mapa só com o centro ainda desenha", () => {
    expect(desenharMapa({ centro: "Tema", ramos: [] }).caixas).toHaveLength(1);
  });
});

describe("validarMapa", () => {
  it("descarta ramos vazios, corta textos longos e corrige cores", () => {
    const v = validarMapa({
      centro: "  X ",
      ramos: [{ texto: "", filhos: [] }, { texto: "a".repeat(200), cor: "neon", filhos: [{ texto: "f" }] }],
    })!;
    expect(v.centro).toBe("X");
    expect(v.ramos).toHaveLength(1);
    expect(v.ramos[0].texto).toHaveLength(80);
    expect(v.ramos[0].cor).toBe("azul"); // cor inválida vira a cor da posição
    expect(v.ramos[0].filhos[0].texto).toBe("f");
  });

  it("limita a profundidade", () => {
    const fundo = { texto: "1", filhos: [{ texto: "2", filhos: [{ texto: "3", filhos: [{ texto: "4", filhos: [] }] }] }] };
    const v = validarMapa({ centro: "c", ramos: [fundo] })!;
    expect(v.ramos[0].filhos[0].filhos[0].filhos).toEqual([]);
  });

  it("recusa o que não é mapa", () => {
    expect(validarMapa(null)).toBeNull();
    expect(validarMapa({ centro: 1, ramos: [] })).toBeNull();
  });
});

describe("texto", () => {
  it("quebra linhas sem cortar palavras", () => {
    expect(quebrarLinhas("Hábitos e ações repetidas no passado")).toEqual(["Hábitos e ações", "repetidas no passado"]);
  });

  it("vira tópicos", () => {
    expect(mapaEmTopicos(mapa)).toContain("  - -ía (comía, vivía)");
  });
});
