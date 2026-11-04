import { describe, expect, it } from "vitest";
import { proximasAulas, separarPedidos, temMapa, validarPedido } from ".";

const hoje = "2026-11-04";

describe("validarPedido", () => {
  it("aceita um pedido completo", () => {
    expect(validarPedido({ turma_id: "t1", data: "2026-11-10", hora: "19:30", mensagem: " Revisão " }, ["t1"], hoje)).toEqual({
      pedido: { turmaId: "t1", data: "2026-11-10", hora: "19:30", mensagem: "Revisão" },
    });
  });

  it("hora é opcional", () => {
    const r = validarPedido({ turma_id: "t1", data: hoje }, ["t1"], hoje);
    expect("pedido" in r && r.pedido.hora).toBe(null);
  });

  it("recusa turma de outro aluno, data passada ou inválida e hora errada", () => {
    expect(validarPedido({ turma_id: "x", data: "2026-11-10" }, ["t1"], hoje)).toEqual({ erro: "Escolha a turma." });
    expect(validarPedido({ turma_id: "t1", data: "2026-11-03" }, ["t1"], hoje)).toEqual({
      erro: "Escolha um dia de hoje em diante.",
    });
    expect(validarPedido({ turma_id: "t1", data: "2026-02-30" }, ["t1"], hoje)).toEqual({ erro: "Escolha o dia da aula." });
    expect(validarPedido({ turma_id: "t1", data: "2026-11-10", hora: "25:00" }, ["t1"], hoje)).toEqual({
      erro: "Horário inválido.",
    });
  });
});

describe("separarPedidos", () => {
  it("deixa recusados e passados no histórico", () => {
    const pedidos = [
      { id: "a", data: "2026-11-20", status: "pendente" as const },
      { id: "b", data: "2026-11-08", status: "aceito" as const },
      { id: "c", data: "2026-11-09", status: "recusado" as const },
      { id: "d", data: "2026-11-01", status: "aceito" as const },
    ];
    const { ativos, passados } = separarPedidos(pedidos, hoje);
    expect(ativos.map((p) => p.id)).toEqual(["b", "a"]);
    expect(passados.map((p) => p.id)).toEqual(["c", "d"]);
  });
});

describe("proximasAulas", () => {
  it("inclui hoje e ordena da mais próxima", () => {
    const aulas = [{ data: "2026-11-12" }, { data: "2026-11-01" }, { data: hoje }];
    expect(proximasAulas(aulas, hoje).map((a) => a.data)).toEqual([hoje, "2026-11-12"]);
  });
});

describe("temMapa", () => {
  it("só conta mapas com ramos", () => {
    expect(temMapa({ mapa: { ramos: [{}] } })).toBe(true);
    expect(temMapa({ mapa: { ramos: [] } })).toBe(false);
    expect(temMapa({ mapa: null })).toBe(false);
  });
});
