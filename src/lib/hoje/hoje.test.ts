import { describe, expect, it } from "vitest";
import { agendaDeHoje, quandoItem, type EntradaHoje } from ".";

const base: EntradaHoje = {
  hoje: "2026-11-05", // quinta-feira
  nomeTurma: new Map([
    ["t1", "Inglês B1"],
    ["t2", "Direito Civil"],
  ]),
  aulas: [],
  horarios: [],
  atividades: [],
  enviadas: new Set(),
  compromissos: [],
  datasTurma: [],
};

describe("agenda de hoje", () => {
  it("vazia quando não tem nada", () => {
    expect(agendaDeHoje(base)).toEqual([]);
  });

  it("junta tudo de hoje e o atrasado, atrasados primeiro", () => {
    const itens = agendaDeHoje({
      ...base,
      aulas: [
        { id: "a1", turma_id: "t1", data: "2026-11-05", titulo: "" },
        { id: "a0", turma_id: "t1", data: "2026-11-03", titulo: "Aula passada" },
        { id: "a2", turma_id: "t1", data: "2026-11-06", titulo: "Amanhã" },
      ],
      horarios: [{ turma_id: "t2", dia_semana: 4, hora_inicio: "19:00:00" }],
      atividades: [
        { id: "x1", titulo: "Lista 1", prazo: "2026-11-02", turma: "Inglês B1" },
        { id: "x2", titulo: "Lista 2", prazo: "2026-11-05", turma: "Inglês B1" },
        { id: "x3", titulo: "Enviada", prazo: "2026-11-01", turma: "Inglês B1" },
        { id: "x4", titulo: "Sem prazo", prazo: null, turma: "Inglês B1" },
        { id: "x5", titulo: "Futura", prazo: "2026-11-10", turma: "Inglês B1" },
      ],
      enviadas: new Set(["x3"]),
      compromissos: [
        { id: "c1", titulo: "Resenha", data: "2026-11-04", hora: null, feito: false, tipo: "tarefa", materia: "Português" },
        { id: "c2", titulo: "Prova", data: "2026-11-05", hora: "08:00:00", feito: false, tipo: "prova", materia: "" },
        { id: "c3", titulo: "Feito", data: "2026-11-01", hora: null, feito: true, tipo: "tarefa", materia: "" },
      ],
      datasTurma: [
        { id: "d1", turma_id: "t2", tipo: "entrega", titulo: "Trabalho final", data: "2026-11-05", ate: null, hora: null },
        { id: "d2", turma_id: "t2", tipo: "prova", titulo: "P1 passada", data: "2026-11-01", ate: null, hora: null },
      ],
    });
    expect(itens.map((i) => i.chave)).toEqual([
      "atividade-x1",
      "compromisso-c1",
      "compromisso-c2",
      "semanal-t2-19:00:00",
      "aula-a1",
      "atividade-x2",
      "calendario-d1",
    ]);
    expect(itens[0].atrasado).toBe(true);
    expect(itens[2]).toMatchObject({ hora: "08:00", detalhe: "Prova", atrasado: false });
    expect(itens[3]).toMatchObject({ hora: "19:00", detalhe: "Direito Civil" });
    expect(itens[4]).toMatchObject({ titulo: "Aula", href: "/aluno/turmas/t1" });
    expect(itens[6].detalhe).toBe("Entrega · Direito Civil");
  });

  it("aula semanal some se já tem aula marcada hoje ou se o calendário diz sem aula", () => {
    const itens = agendaDeHoje({
      ...base,
      aulas: [{ id: "a1", turma_id: "t1", data: "2026-11-05", titulo: "Revisão" }],
      horarios: [
        { turma_id: "t1", dia_semana: 4, hora_inicio: "10:00" },
        { turma_id: "t2", dia_semana: 4, hora_inicio: "19:00" },
        { turma_id: "t2", dia_semana: 3, hora_inicio: "19:00" },
      ],
      datasTurma: [{ id: "d1", turma_id: "t2", tipo: "sem_aula", titulo: "Recesso", data: "2026-11-02", ate: "2026-11-08", hora: null }],
    });
    expect(itens.map((i) => i.chave)).toEqual(["calendario-d1", "aula-a1"]);
  });
});

describe("quando", () => {
  it("mostra atraso, hora ou hoje", () => {
    expect(quandoItem({ data: "2026-11-03", hora: null, atrasado: true })).toBe("Atrasado · 03/11");
    expect(quandoItem({ data: "2026-11-05", hora: "19:00", atrasado: false })).toBe("19:00");
    expect(quandoItem({ data: "2026-11-05", hora: null, atrasado: false })).toBe("Hoje");
  });
});
