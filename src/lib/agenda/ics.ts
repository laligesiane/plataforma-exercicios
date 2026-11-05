// Calendário .ics para assinatura (Google Agenda, Apple, Outlook). Atualiza sozinho quando o horário muda.
import { diasRRule, type Horario } from ".";

export type EventoTurma = Horario & { id: string; turma_nome: string };

/** Evento de um dia só (compromisso do aluno, prazo). Sem hora vira evento de dia inteiro. */
export type EventoUnico = {
  id: string;
  titulo: string;
  descricao?: string;
  data: string; // "AAAA-MM-DD"
  hora?: string | null; // "HH:MM" ou "HH:MM:SS"
  duracao_min?: number;
  fuso?: string;
};

const vtimezoneSaoPaulo = [
  "BEGIN:VTIMEZONE",
  "TZID:America/Sao_Paulo",
  "BEGIN:STANDARD",
  "DTSTART:19700101T000000",
  "TZOFFSETFROM:-0300",
  "TZOFFSETTO:-0300",
  "TZNAME:-03",
  "END:STANDARD",
  "END:VTIMEZONE",
];

function escapar(texto: string) {
  return texto.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

function dois(n: number) {
  return String(n).padStart(2, "0");
}

/** Monta o .ics. `criadoEm` fixa a primeira semana; as próximas vêm do RRULE. */
export function gerarIcs(eventos: EventoTurma[], nomeCalendario: string, agora = new Date(), unicos: EventoUnico[] = []) {
  const carimboUtc = agora.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  // Primeira ocorrência: a semana de 05/01/2026 (segunda) serve de âncora fixa para todas as aulas.
  const ancora = Date.UTC(2026, 0, 4); // domingo
  const linhas = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Repasa//Agenda//PT-BR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapar(nomeCalendario)}`,
    "X-WR-TIMEZONE:America/Sao_Paulo",
    ...vtimezoneSaoPaulo,
  ];
  for (const e of eventos) {
    const [h, m] = e.hora_inicio.split(":").map(Number);
    const inicio = new Date(ancora + e.dia_semana * 864e5 + (h * 60 + m) * 6e4);
    const fim = new Date(inicio.getTime() + e.duracao_min * 6e4);
    const local = (d: Date) =>
      `${d.getUTCFullYear()}${dois(d.getUTCMonth() + 1)}${dois(d.getUTCDate())}T${dois(d.getUTCHours())}${dois(d.getUTCMinutes())}00`;
    linhas.push(
      "BEGIN:VEVENT",
      `UID:${e.id}@repasa.com.br`,
      `DTSTAMP:${carimboUtc}`,
      `DTSTART;TZID=${e.fuso}:${local(inicio)}`,
      `DTEND;TZID=${e.fuso}:${local(fim)}`,
      `RRULE:FREQ=WEEKLY;BYDAY=${diasRRule[e.dia_semana]}`,
      `SUMMARY:${escapar(e.turma_nome)}`,
      `DESCRIPTION:${escapar(`Aula da turma ${e.turma_nome} na Repasa`)}`,
      "END:VEVENT",
    );
  }
  for (const e of unicos) linhas.push(...linhasEventoUnico(e, carimboUtc));
  linhas.push("END:VCALENDAR");
  return linhas.join("\r\n") + "\r\n";
}

function linhasEventoUnico(e: EventoUnico, carimboUtc: string) {
  const [a, m, d] = e.data.split("-").map(Number);
  const dia = (data: Date) => `${data.getUTCFullYear()}${dois(data.getUTCMonth() + 1)}${dois(data.getUTCDate())}`;
  let inicio: string;
  let fim: string;
  if (e.hora) {
    const [h, min] = e.hora.split(":").map(Number);
    const comeco = new Date(Date.UTC(a, m - 1, d, h, min));
    const termino = new Date(comeco.getTime() + (e.duracao_min ?? 60) * 6e4);
    const local = (x: Date) => `${dia(x)}T${dois(x.getUTCHours())}${dois(x.getUTCMinutes())}00`;
    const fuso = e.fuso ?? "America/Sao_Paulo";
    inicio = `DTSTART;TZID=${fuso}:${local(comeco)}`;
    fim = `DTEND;TZID=${fuso}:${local(termino)}`;
  } else {
    inicio = `DTSTART;VALUE=DATE:${dia(new Date(Date.UTC(a, m - 1, d)))}`;
    fim = `DTEND;VALUE=DATE:${dia(new Date(Date.UTC(a, m - 1, d + 1)))}`;
  }
  return [
    "BEGIN:VEVENT",
    `UID:${e.id}@repasa.com.br`,
    `DTSTAMP:${carimboUtc}`,
    inicio,
    fim,
    `SUMMARY:${escapar(e.titulo)}`,
    ...(e.descricao ? [`DESCRIPTION:${escapar(e.descricao)}`] : []),
    "END:VEVENT",
  ];
}
