import { describe, expect, it } from "vitest";
import { itensColados } from "./colar";

describe("colar vários itens", () => {
  it("lacuna: resposta entre colchetes, alternativas com |", () => {
    const { itens, ignoradas } = itensColados("lacuna", "Cuando era niño, [iba] al parque.\nAyer [fui | estuve] al cine.\nsem colchete");
    expect(itens).toHaveLength(2);
    expect(itens[0]).toMatchObject({ enunciado: "Cuando era niño, ___ al parque.", aceitas: ["iba"] });
    expect(itens[1]).toMatchObject({ aceitas: ["fui", "estuve"] });
    expect(ignoradas).toBe(1);
  });

  it("arrastar usa a primeira resposta", () => {
    expect(itensColados("arrastar", "Vivo [en] São Paulo.").itens[0]).toMatchObject({ enunciado: "Vivo ___ São Paulo.", resposta: "en" });
  });

  it("múltipla escolha: * marca a certa; sem marca, a primeira", () => {
    const { itens } = itensColados("multipla_escolha", "Capital do Peru? ; Cusco ; *Lima\nCor do céu? ; azul ; verde\nsó pergunta ; uma");
    expect(itens).toHaveLength(2);
    const alt = (i: number) => (itens[i].alternativas as { texto: string; correta: boolean }[]).map((a) => [a.texto, a.correta]);
    expect(alt(0)).toEqual([["Cusco", false], ["Lima", true]]);
    expect(alt(1)).toEqual([["azul", true], ["verde", false]]);
  });

  it("relacionar aceita ponto e vírgula ou tab", () => {
    const { itens } = itensColados("relacionar", "perro ; cachorro\ngato\tgato");
    expect(itens.map((i) => [i.esquerda, i.direita])).toEqual([["perro", "cachorro"], ["gato", "gato"]]);
  });

  it("classificar reaproveita colunas existentes e cria as que faltam", () => {
    const { itens, colunasNovas } = itensColados("classificar", "comí ; pretérito\ncomo ; Presente\nbebí ; Pretérito", [
      { id: "c1", nome: "Pretérito" },
    ]);
    expect(colunasNovas).toHaveLength(1);
    expect(colunasNovas[0].nome).toBe("Presente");
    expect(itens.map((i) => i.colunaId)).toEqual(["c1", colunasNovas[0].id, "c1"]);
  });
});
