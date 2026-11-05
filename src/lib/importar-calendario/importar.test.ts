import { describe, expect, it } from "vitest";
import { adivinharTipo, lerCalendario, lerIcs, lerTexto, validarItensImportados } from ".";

const hoje = "2026-11-05";
const resumo = (itens: ReturnType<typeof lerTexto>) => itens.map((i) => [i.data, i.titulo, i.ate, i.hora, i.tipo]);

describe("adivinharTipo", () => {
  it("reconhece os tipos mais comuns", () => {
    expect(adivinharTipo("Prova 1 de Cálculo")).toBe("prova");
    expect(adivinharTipo("P2")).toBe("prova");
    expect(adivinharTipo("Entrega do trabalho final")).toBe("entrega");
    expect(adivinharTipo("Feriado: Tiradentes")).toBe("sem_aula");
    expect(adivinharTipo("Férias")).toBe("sem_aula");
    expect(adivinharTipo("Início das aulas")).toBe("aula");
    expect(adivinharTipo("Matrícula")).toBe("outro");
  });
});

describe("lerTexto", () => {
  it("lê datas com barra, com e sem ano", () => {
    const itens = lerTexto("15/02/2027 - Início das aulas\n20/04/2027: Prova 1\n21/04/2027 Feriado (Tiradentes)", hoje);
    expect(resumo(itens)).toEqual([
      ["2027-02-15", "Início das aulas", null, null, "aula"],
      ["2027-04-20", "Prova 1", null, null, "prova"],
      ["2027-04-21", "Feriado (Tiradentes)", null, null, "sem_aula"],
    ]);
  });

  it("usa o ano escrito no título do calendário", () => {
    const itens = lerTexto("Calendário Acadêmico 2027\n15/02 Início das aulas\n03/03 Prova", hoje);
    expect(itens.map((i) => i.data)).toEqual(["2027-02-15", "2027-03-03"]);
  });

  it("sem ano em lugar nenhum, escolhe o mais perto de hoje", () => {
    const itens = lerTexto("20/11 Prova de Física\n10/02 Volta às aulas", hoje);
    expect(itens.map((i) => i.data)).toEqual(["2026-11-20", "2027-02-10"]);
  });

  it("entende mês por extenso e períodos", () => {
    const itens = lerTexto(
      "15 de março de 2027 - Entrega do relatório\n20 a 24 de abril de 2027: Semana de provas\n01/07/2027 a 31/07/2027 Férias",
      hoje,
    );
    expect(resumo(itens)).toEqual([
      ["2027-03-15", "Entrega do relatório", null, null, "entrega"],
      ["2027-04-20", "Semana de provas", "2027-04-24", null, "prova"],
      ["2027-07-01", "Férias", "2027-07-31", null, "sem_aula"],
    ]);
  });

  it("entende '15 a 20/03' e não confunde 'Prova 2 - 10/04' com período", () => {
    const itens = lerTexto("Calendário 2027\n15 a 20/03 Semana de recepção\nProva 2 - 10/04", hoje);
    expect(resumo(itens)).toEqual([
      ["2027-03-15", "Semana de recepção", "2027-03-20", null, "outro"],
      ["2027-04-10", "Prova 2", null, null, "prova"],
    ]);
  });

  it("lê listas com o mês no título", () => {
    const itens = lerTexto("MARÇO 2027\n02 - Início das aulas\n15 a 19 – Semana de provas\nABRIL\n21 Tiradentes, feriado", hoje);
    expect(resumo(itens)).toEqual([
      ["2027-03-02", "Início das aulas", null, null, "aula"],
      ["2027-03-15", "Semana de provas", "2027-03-19", null, "prova"],
      ["2027-04-21", "Tiradentes, feriado", null, null, "sem_aula"],
    ]);
  });

  it("pega horário e tira o dia da semana do nome", () => {
    const itens = lerTexto("Segunda-feira, 22/03/2027 às 19h30 - Prova de Cálculo", hoje);
    expect(resumo(itens)).toEqual([["2027-03-22", "Prova de Cálculo", null, "19:30", "prova"]]);
  });

  it("separa várias datas na mesma linha", () => {
    const itens = lerTexto("P1: 10/04/2027, P2: 15/05/2027", hoje);
    expect(resumo(itens)).toEqual([
      ["2027-04-10", "P1", null, null, "prova"],
      ["2027-05-15", "P2", null, null, "prova"],
    ]);
  });

  it("lê linhas de tabela copiadas (tab ou barra vertical)", () => {
    const itens = lerTexto("Data\tEvento\n05/03/2027\tAula inaugural\n| 12/03/2027 | Entrega da lista 1 |", hoje);
    expect(resumo(itens)).toEqual([
      ["2027-03-05", "Aula inaugural", null, null, "aula"],
      ["2027-03-12", "Entrega da lista 1", null, null, "entrega"],
    ]);
  });

  it("ignora datas impossíveis e repetidas", () => {
    const itens = lerTexto("31/02/2027 Nada\n10/03/2027 Prova\n10/03/2027 prova", hoje);
    expect(itens).toHaveLength(1);
  });

  it("calendário que vira o ano continua em ordem", () => {
    const itens = lerTexto("Calendário 2026\n10/08 Início do semestre\n15/12 Fim das aulas\n10/02 Volta", "2026-07-01");
    expect(itens.map((i) => i.data)).toEqual(["2026-08-10", "2026-12-15", "2027-02-10"]);
  });
});

describe("lerIcs", () => {
  const ics = [
    "BEGIN:VCALENDAR",
    "BEGIN:VEVENT",
    "DTSTART;VALUE=DATE:20270301",
    "DTEND;VALUE=DATE:20270302",
    "SUMMARY:Início das aulas",
    "END:VEVENT",
    "BEGIN:VEVENT",
    "DTSTART;VALUE=DATE:20270701",
    "DTEND;VALUE=DATE:20270801",
    "SUMMARY:Férias de\r\n  julho",
    "END:VEVENT",
    "BEGIN:VEVENT",
    "DTSTART:20270322T220000Z",
    "DTEND:20270322T230000Z",
    "SUMMARY:Prova 1\\, Cálculo",
    "END:VEVENT",
    "BEGIN:VEVENT",
    "DTSTART;TZID=America/Sao_Paulo:20270405T080000",
    "SUMMARY:Cancelada",
    "STATUS:CANCELLED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  it("lê eventos de dia inteiro, períodos e horários em UTC", () => {
    expect(resumo(lerIcs(ics))).toEqual([
      ["2027-03-01", "Início das aulas", null, null, "aula"],
      ["2027-03-22", "Prova 1, Cálculo", null, "19:00", "prova"],
      ["2027-07-01", "Férias de julho", "2027-07-31", null, "sem_aula"],
    ]);
  });

  it("lerCalendario escolhe o leitor pelo conteúdo", () => {
    expect(lerCalendario(ics, hoje)).toHaveLength(3);
    expect(lerCalendario("10/03/2027 Prova", hoje)).toHaveLength(1);
  });
});

describe("validarItensImportados", () => {
  it("aceita itens bons e limpa o 'até' inválido", () => {
    const r = validarItensImportados([{ titulo: " Prova ", data: "2027-03-10", ate: "2027-03-10", hora: "08:00", tipo: "prova" }]);
    expect(r).toEqual({ itens: [{ titulo: "Prova", data: "2027-03-10", ate: null, hora: "08:00", tipo: "prova" }] });
  });

  it("recusa lista vazia, nome vazio e tipo errado", () => {
    expect(validarItensImportados([])).toHaveProperty("erro");
    expect(validarItensImportados([{ titulo: "", data: "2027-03-10", tipo: "prova" }])).toHaveProperty("erro");
    expect(validarItensImportados([{ titulo: "X", data: "2027-03-10", tipo: "festa" }])).toHaveProperty("erro");
  });
});
