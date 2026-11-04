// Funções puras de agenda: próxima aula e link "Adicionar ao Google Agenda".

export type Horario = {
  dia_semana: number; // 0 = domingo
  hora_inicio: string; // "HH:MM" ou "HH:MM:SS"
  duracao_min: number;
  fuso: string;
};

export const diasDaSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"] as const;
export const diasRRule = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"] as const;

/** Data e hora "de parede" no fuso indicado. */
function agoraNoFuso(agora: Date, fuso: string) {
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: fuso,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      weekday: "short",
    })
      .formatToParts(agora)
      .map((p) => [p.type, p.value]),
  );
  return {
    ano: Number(partes.year),
    mes: Number(partes.month),
    dia: Number(partes.day),
    minutos: Number(partes.hour) * 60 + Number(partes.minute),
    diaSemana: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(partes.weekday),
  };
}

function minutosDe(hora: string) {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

export function formatarHora(hora: string) {
  return hora.slice(0, 5);
}

/** Data (no fuso do horário) da próxima aula, contando a de hoje se ainda não começou. */
export function proximaData(h: Horario, agora = new Date()) {
  const hoje = agoraNoFuso(agora, h.fuso);
  let dias = (h.dia_semana - hoje.diaSemana + 7) % 7;
  if (dias === 0 && minutosDe(h.hora_inicio) <= hoje.minutos) dias = 7;
  // Aritmética de calendário em UTC para não sofrer com o fuso do servidor.
  const data = new Date(Date.UTC(hoje.ano, hoje.mes - 1, hoje.dia + dias));
  return { ano: data.getUTCFullYear(), mes: data.getUTCMonth() + 1, dia: data.getUTCDate() };
}

/** A próxima aula entre vários horários, para mostrar "Próxima aula: quinta, 12/11 às 19:00". */
export function proximaAula(horarios: Horario[], agora = new Date()) {
  let melhor: { horario: Horario; chave: string; data: ReturnType<typeof proximaData> } | null = null;
  for (const horario of horarios) {
    const data = proximaData(horario, agora);
    const chave = `${data.ano}${dois(data.mes)}${dois(data.dia)}${formatarHora(horario.hora_inicio)}`;
    if (!melhor || chave < melhor.chave) melhor = { horario, chave, data };
  }
  return melhor && { horario: melhor.horario, ...melhor.data };
}

function dois(n: number) {
  return String(n).padStart(2, "0");
}

function carimbo(ano: number, mes: number, dia: number, minutos: number) {
  const data = new Date(Date.UTC(ano, mes - 1, dia, 0, minutos));
  return (
    `${data.getUTCFullYear()}${dois(data.getUTCMonth() + 1)}${dois(data.getUTCDate())}` +
    `T${dois(data.getUTCHours())}${dois(data.getUTCMinutes())}00`
  );
}

/** Link que abre o Google Agenda com a aula semanal já preenchida (sem login na Repasa). */
export function linkGoogleAgenda(h: Horario, titulo: string, detalhes: string, agora = new Date()) {
  const { ano, mes, dia } = proximaData(h, agora);
  const inicio = minutosDe(h.hora_inicio);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: titulo,
    dates: `${carimbo(ano, mes, dia, inicio)}/${carimbo(ano, mes, dia, inicio + h.duracao_min)}`,
    ctz: h.fuso,
    recur: `RRULE:FREQ=WEEKLY;BYDAY=${diasRRule[h.dia_semana]}`,
    details: detalhes,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function descreverHorario(h: Horario) {
  const fim = minutosDe(h.hora_inicio) + h.duracao_min;
  return `${diasDaSemana[h.dia_semana]}, ${formatarHora(h.hora_inicio)}–${dois(Math.floor(fim / 60) % 24)}:${dois(fim % 60)}`;
}
