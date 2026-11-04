import { describe, expect, it } from "vitest";
import { descreverHorario, linkGoogleAgenda, proximaAula, proximaData, type Horario } from ".";

const terca19h: Horario = { dia_semana: 2, hora_inicio: "19:00:00", duracao_min: 90, fuso: "America/Sao_Paulo" };
// Quarta, 4/11/2026, 13:22 em São Paulo (16:22 UTC).
const agora = new Date("2026-11-04T16:22:00Z");

describe("proximaData", () => {
  it("pula para a próxima semana quando o dia já passou", () => {
    expect(proximaData(terca19h, agora)).toEqual({ ano: 2026, mes: 11, dia: 10 });
  });

  it("conta hoje se a aula ainda não começou", () => {
    expect(proximaData({ ...terca19h, dia_semana: 3 }, agora)).toEqual({ ano: 2026, mes: 11, dia: 4 });
  });

  it("pula uma semana se a aula de hoje já começou", () => {
    expect(proximaData({ ...terca19h, dia_semana: 3, hora_inicio: "08:00" }, agora)).toEqual({ ano: 2026, mes: 11, dia: 11 });
  });

  it("usa o fuso da turma, não o UTC", () => {
    // 01:00 UTC de quinta ainda é quarta 22:00 em São Paulo.
    expect(proximaData({ ...terca19h, dia_semana: 3, hora_inicio: "23:00" }, new Date("2026-11-05T01:00:00Z"))).toEqual({
      ano: 2026,
      mes: 11,
      dia: 4,
    });
  });
});

describe("proximaAula", () => {
  it("escolhe o horário mais próximo", () => {
    const quinta = { ...terca19h, dia_semana: 4 };
    expect(proximaAula([terca19h, quinta], agora)).toMatchObject({ horario: quinta, dia: 5 });
  });

  it("devolve null sem horários", () => {
    expect(proximaAula([], agora)).toBeNull();
  });
});

describe("linkGoogleAgenda", () => {
  it("monta evento semanal com início, fim e fuso", () => {
    const url = new URL(linkGoogleAgenda(terca19h, "Espanhol A1", "Aula na Repasa", agora));
    expect(url.origin + url.pathname).toBe("https://calendar.google.com/calendar/render");
    expect(url.searchParams.get("dates")).toBe("20261110T190000/20261110T203000");
    expect(url.searchParams.get("recur")).toBe("RRULE:FREQ=WEEKLY;BYDAY=TU");
    expect(url.searchParams.get("ctz")).toBe("America/Sao_Paulo");
    expect(url.searchParams.get("text")).toBe("Espanhol A1");
  });

  it("vira o dia quando a aula passa da meia-noite", () => {
    const url = new URL(linkGoogleAgenda({ ...terca19h, hora_inicio: "23:30" }, "x", "", agora));
    expect(url.searchParams.get("dates")).toBe("20261110T233000/20261111T010000");
  });
});

describe("descreverHorario", () => {
  it("mostra dia e intervalo", () => {
    expect(descreverHorario(terca19h)).toBe("Terça, 19:00–20:30");
  });
});
