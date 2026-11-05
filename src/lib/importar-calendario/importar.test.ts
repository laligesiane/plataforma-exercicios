import { describe, expect, it } from "vitest";
import { adivinharTipo, lerCalendario, lerIcs, lerTexto, validarItensImportados } from ".";
import { linhasDaPagina } from "./pdf";

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

describe("calendário em PDF com colunas lado a lado", () => {
  // Formato comum de faculdade: grade dos meses à esquerda, cronograma à direita
  // e uma tabela de feriados com o mês numa coluna, centralizado nas suas linhas.
  const item = (str: string, x: number, y: number, width: number, height = 9) => ({ str, transform: [height, 0, 0, height, x, y], width, height });
  const pagina = [
    item("Calendário Acadêmico - 2026.2", 335, 691, 250, 18),
    item("JULHO", 117, 616, 30),
    item("CRONOGRAMA", 784, 616, 70),
    item("D", 57, 601, 7),
    item("S", 82, 601, 5),
    item("JULHO", 623, 601, 30),
    item("Dias Letivos:", 872, 601, 52),
    item("0", 932, 601, 5),
    item("1", 129, 586, 6),
    item("2", 153, 586, 6),
    item("20 a 25/07 - Entre esses dias ocorrerá a Semana Acadêmica.", 623, 587, 246),
    item("12", 55, 557, 11),
    item("13", 79, 557, 11),
    item("03/08 - Início do Período Letivo 2026.2", 623, 558, 159),
    item("31/10 a 14/11 - Semana de Prova para a 1ª Chamada - PARALELA ONLINE / ADAPTAÇÃO E", 623, 441, 370),
    item("DEPENDÊNCIA", 623, 428, 60),
    item("FERIADOS, RECESSOS E FÉRIAS", 255, 353, 125),
    item("JULHO", 238, 340, 22),
    item("Segundas - Feiras", 447, 339, 65),
    item("17", 548, 339, 8),
    item("07/12 a 12/12 - Semana de Prova para a 2ª CHAMADA", 623, 339, 333),
    item("SETEMBRO", 230, 312, 37),
    item("07 - Independência do Brasil", 284, 311, 93),
    item("12 - Nossa Senhora da Aparecida / 15 -", 284, 295, 127),
    item("19/12 - Fim do Período Letivo 2026.2", 623, 296, 152),
    item("OUTUBRO", 232, 289, 34),
    item("Dia do Professor", 284, 284, 54),
    item("Sextas - Feiras", 447, 281, 53),
    item("19", 548, 281, 8),
    item("22/12 - Divulgação do Boletim", 623, 281, 124),
    item("02 - Finados / 15 - Proc. República", 284, 270, 112),
    item("NOVEMBRO", 228, 259, 41),
    item("/ 20 - Dia Nacional de Zumbi e da", 284, 259, 109),
    item("Consciência Negra", 284, 249, 60),
    item("DEZEMBRO", 229, 237, 38),
    item("25 - Natal", 284, 237, 32),
    item("Total de dias letivos", 447, 237, 75),
    item("115", 546, 237, 12),
  ];

  it("separa as colunas, junta linhas quebradas e põe o mês antes dos feriados dele", () => {
    const linhas = linhasDaPagina(pagina);
    expect(linhas).toContain("OUTUBRO 12 - Nossa Senhora da Aparecida / 15 - Dia do Professor\t19/12 - Fim do Período Letivo 2026.2");
    expect(linhas).toContain("NOVEMBRO 02 - Finados / 15 - Proc. República / 20 - Dia Nacional de Zumbi e da Consciência Negra");
    expect(linhas.some((l) => l.endsWith("ADAPTAÇÃO E DEPENDÊNCIA"))).toBe(true);
  });

  it("lê o cronograma e os feriados sem misturar com a grade nem com os dias letivos", () => {
    const itens = lerTexto(linhasDaPagina(pagina).join("\n"), hoje);
    expect(resumo(itens)).toEqual([
      ["2026-07-20", "Entre esses dias ocorrerá a Semana Acadêmica.", "2026-07-25", null, "outro"],
      ["2026-08-03", "Início do Período Letivo 2026.2", null, null, "aula"],
      ["2026-09-07", "Independência do Brasil", null, null, "sem_aula"],
      ["2026-10-12", "Nossa Senhora da Aparecida", null, null, "sem_aula"],
      ["2026-10-15", "Dia do Professor", null, null, "sem_aula"],
      ["2026-10-31", "Semana de Prova para a 1ª Chamada - PARALELA ONLINE / ADAPTAÇÃO E DEPENDÊNCIA", "2026-11-14", null, "prova"],
      ["2026-11-02", "Finados", null, null, "sem_aula"],
      ["2026-11-15", "Proc. República", null, null, "sem_aula"],
      ["2026-11-20", "Dia Nacional de Zumbi e da Consciência Negra", null, null, "sem_aula"],
      ["2026-12-07", "Semana de Prova para a 2ª CHAMADA", "2026-12-12", null, "prova"],
      ["2026-12-19", "Fim do Período Letivo 2026.2", null, null, "aula"],
      ["2026-12-22", "Divulgação do Boletim", null, null, "outro"],
      ["2026-12-25", "Natal", null, null, "sem_aula"],
    ]);
  });

  it("tabela colada com tab: a data se junta ao nome da coluna ao lado", () => {
    const itens = lerTexto("Calendário 2027\nProva 1\t10/04\nMAIO\n15\tEntrega do relatório", hoje);
    expect(resumo(itens)).toEqual([
      ["2027-04-10", "Prova 1", null, null, "prova"],
      ["2027-05-15", "Entrega do relatório", null, null, "entrega"],
    ]);
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
