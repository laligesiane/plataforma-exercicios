import { describe, expect, it } from "vitest";
import { gerarIcs } from "../agenda/ics";
import { atrasado, eventoDoCompromisso, separarCompromissos, validarCompromisso, type Compromisso } from ".";

const base: Compromisso = {
  id: "c1",
  tipo: "prova",
  titulo: "P1 de Cálculo",
  materia: "Faculdade",
  data: "2026-11-10",
  hora: null,
  feito: false,
  nota: "",
  anotacao: "",
};

describe("validarCompromisso", () => {
  it("aceita um compromisso completo e limpa os campos", () => {
    const r = validarCompromisso({ tipo: "prova", titulo: "  P1 ", data: "2026-11-10", hora: "19:30:00", feito: "on", nota: "8,5" });
    expect(r).toEqual({
      compromisso: { tipo: "prova", titulo: "P1", materia: "", data: "2026-11-10", hora: "19:30", feito: true, nota: "8,5", anotacao: "" },
    });
  });

  it("recusa tipo, título, data e hora inválidos", () => {
    expect(validarCompromisso({ tipo: "festa", titulo: "x", data: "2026-11-10" })).toEqual({ erro: "Escolha o tipo." });
    expect(validarCompromisso({ tipo: "tarefa", titulo: " ", data: "2026-11-10" })).toEqual({ erro: "Dê um nome ao compromisso." });
    expect(validarCompromisso({ tipo: "tarefa", titulo: "x", data: "2026-02-30" })).toEqual({ erro: "Escolha o dia." });
    expect(validarCompromisso({ tipo: "tarefa", titulo: "x", data: "2026-11-10", hora: "25:00" })).toEqual({ erro: "Horário inválido." });
  });

  it("aceita datas passadas, para registrar o que já aconteceu", () => {
    expect("compromisso" in validarCompromisso({ tipo: "tarefa", titulo: "x", data: "2020-01-01" })).toBe(true);
  });
});

describe("separarCompromissos", () => {
  const hoje = "2026-11-05";
  const itens = [
    { ...base, id: "futuro", data: "2026-11-10" },
    { ...base, id: "atrasado", data: "2026-11-01" },
    { ...base, id: "feito-antigo", data: "2026-10-20", feito: true },
    { ...base, id: "hoje-com-hora", data: hoje, hora: "08:00:00" },
    { ...base, id: "hoje-sem-hora", data: hoje },
  ];

  it("põe pela frente o que não foi feito, inclusive atrasado, em ordem de data e hora", () => {
    const { pelaFrente, passados } = separarCompromissos(itens, hoje);
    expect(pelaFrente.map((c) => c.id)).toEqual(["atrasado", "hoje-com-hora", "hoje-sem-hora", "futuro"]);
    expect(passados.map((c) => c.id)).toEqual(["feito-antigo"]);
  });

  it("marca atrasado só o que não foi feito e já passou", () => {
    expect(atrasado(itens[1], hoje)).toBe(true);
    expect(atrasado(itens[2], hoje)).toBe(false);
    expect(atrasado(itens[0], hoje)).toBe(false);
  });
});

describe("compromisso no .ics", () => {
  it("vira evento de dia inteiro quando não tem hora", () => {
    const ics = gerarIcs([], "Repasa", new Date("2026-11-04T16:22:00Z"), [eventoDoCompromisso(base)]);
    expect(ics).toContain("DTSTART;VALUE=DATE:20261110");
    expect(ics).toContain("DTEND;VALUE=DATE:20261111");
    expect(ics).toContain("SUMMARY:Prova: P1 de Cálculo (Faculdade)");
    expect(ics).toContain("UID:compromisso-c1@repasa.com.br");
  });

  it("usa a hora no fuso de São Paulo e mostra feito e nota", () => {
    const ics = gerarIcs([], "Repasa", new Date(), [
      eventoDoCompromisso({ ...base, hora: "23:30:00", feito: true, nota: "9; ótimo" }),
    ]);
    expect(ics).toContain("DTSTART;TZID=America/Sao_Paulo:20261110T233000");
    expect(ics).toContain("DTEND;TZID=America/Sao_Paulo:20261111T003000");
    expect(ics).toContain("SUMMARY:✓ Prova: P1 de Cálculo (Faculdade)");
    expect(ics).toContain("DESCRIPTION:Feito\\nNota: 9\\; ótimo");
  });
});
