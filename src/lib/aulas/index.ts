// Aulas da turma: tipos e formatação (funções puras).

import { fmt } from "../../i18n/config";
import { datasPt, type TextosDatas } from "../../i18n/dicionarios/datasPt";

export type Aula = {
  id: string;
  turma_id: string;
  data: string; // "AAAA-MM-DD"
  titulo: string;
  resumo: string;
  proximos_passos: string;
  tarefa: string;
};

export const camposAula = "id, turma_id, data, titulo, resumo, proximos_passos, tarefa";

const formatos = new Map<string, Intl.DateTimeFormat>();
function formato(locale: string) {
  let f = formatos.get(locale);
  if (!f) formatos.set(locale, (f = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" })));
  return f;
}

/** "terça-feira, 10 de novembro" a partir de "2026-11-10", sem depender do fuso do servidor. */
export function formatarData(data: string, locale = "pt-BR") {
  const [a, m, d] = data.split("-").map(Number);
  return formato(locale).format(new Date(Date.UTC(a, m - 1, d)));
}

/** Data de hoje (AAAA-MM-DD) no fuso indicado. */
export function hojeNoFuso(fuso = "America/Sao_Paulo", agora = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: fuso, year: "numeric", month: "2-digit", day: "2-digit" }).format(
    agora,
  );
}

/** Última aula já dada (data até hoje), a mais recente. Aulas futuras ficam de fora. */
export function ultimaAula<T extends Pick<Aula, "data">>(aulas: T[], hoje: string) {
  return aulas.filter((a) => a.data <= hoje).sort((x, y) => y.data.localeCompare(x.data))[0] ?? null;
}

/** Título para mostrar: o dado pelo professor ou "Aula de <data>". */
export function tituloAula(aula: Pick<Aula, "titulo" | "data">, t: TextosDatas = datasPt, locale = "pt-BR") {
  return aula.titulo.trim() || fmt(t.aulaDe, { data: formatarData(aula.data, locale) });
}

export function dataValida(data: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return false;
  const [a, m, d] = data.split("-").map(Number);
  const dt = new Date(Date.UTC(a, m - 1, d));
  return dt.getUTCFullYear() === a && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}
