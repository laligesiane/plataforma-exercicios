import { describe, expect, it } from "vitest";
import { andamentoDosAlunos, itensMaisErrados, type RespostaTurma } from ".";

const r = (aluno_id: string, atividade_id: string, item_id: string, status: string, criada_em: string): RespostaTurma => ({
  aluno_id,
  atividade_id,
  item_id,
  status,
  criada_em,
});

const atividades = [
  { id: "a1", titulo: "A1", totalItens: 2 },
  { id: "a2", titulo: "A2", totalItens: 3 },
];
const agora = new Date("2026-11-05T12:00:00Z");

describe("andamento dos alunos", () => {
  const respostas = [
    r("ana", "a1", "i1", "errado", "2026-11-04T10:00:00Z"),
    r("ana", "a1", "i1", "certo", "2026-11-04T10:01:00Z"),
    r("ana", "a1", "i2", "certo", "2026-11-04T10:02:00Z"),
    r("ana", "a2", "j1", "errado", "2026-11-04T10:03:00Z"),
    r("bia", "a1", "i1", "certo", "2026-10-20T10:00:00Z"),
  ];
  const [ana, bia, caio] = andamentoDosAlunos(["ana", "bia", "caio"], atividades, respostas, agora);

  it("conta atividades concluídas e em andamento", () => {
    expect(ana).toMatchObject({ concluidas: 1, emAndamento: 1 });
    expect(bia).toMatchObject({ concluidas: 0, emAndamento: 1 });
  });

  it("usa a última resposta de cada item no aproveitamento", () => {
    expect(ana.aproveitamento).toBeCloseTo(2 / 3);
    expect(caio.aproveitamento).toBeNull();
  });

  it("marca quem parou e quem não começou", () => {
    expect(ana.situacao).toBe("em_dia");
    expect(bia.situacao).toBe("parado");
    expect(caio.situacao).toBe("sem_comecar");
  });
});

describe("itens mais errados", () => {
  it("ordena por quantos alunos erraram e ignora quem saiu da turma", () => {
    const respostas = [
      r("ana", "a1", "i1", "errado", "1"),
      r("bia", "a1", "i1", "errado", "2"),
      r("ana", "a1", "i2", "errado", "3"),
      r("bia", "a1", "i2", "certo", "4"),
      r("ex", "a1", "i3", "errado", "5"),
    ];
    expect(itensMaisErrados(respostas, ["ana", "bia"])).toEqual([
      { atividadeId: "a1", itemId: "i1", alunosComErro: 2, alunosQueResponderam: 2 },
      { atividadeId: "a1", itemId: "i2", alunosComErro: 1, alunosQueResponderam: 2 },
    ]);
  });
});
