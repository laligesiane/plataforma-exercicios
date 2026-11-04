import { describe, expect, it } from "vitest";
import { gerarIcs } from "./ics";

describe("gerarIcs", () => {
  const ics = gerarIcs(
    [{ id: "abc", turma_nome: "Espanhol, A1", dia_semana: 2, hora_inicio: "19:00:00", duracao_min: 90, fuso: "America/Sao_Paulo" }],
    "Repasa",
    new Date("2026-11-04T16:22:00Z"),
  );

  it("cria um evento semanal na terça, no fuso da turma", () => {
    expect(ics).toContain("DTSTART;TZID=America/Sao_Paulo:20260106T190000");
    expect(ics).toContain("DTEND;TZID=America/Sao_Paulo:20260106T203000");
    expect(ics).toContain("RRULE:FREQ=WEEKLY;BYDAY=TU");
    expect(ics).toContain("UID:abc@repasa.com.br");
  });

  it("escapa vírgulas e usa CRLF", () => {
    expect(ics).toContain("SUMMARY:Espanhol\\, A1");
    expect(ics.split("\r\n")[0]).toBe("BEGIN:VCALENDAR");
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
  });
});
