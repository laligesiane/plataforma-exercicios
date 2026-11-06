// Agenda de hoje do aluno, para o card do início: tudo que é de hoje e o que ficou atrasado.
// Junta aulas marcadas, aulas semanais da turma, atividades com prazo, compromissos pessoais e
// datas do calendário da turma. Funções puras, sem depender do fuso do servidor.

import { fmt } from "../../i18n/config";
import { datasPt, type TextosDatas } from "../../i18n/dicionarios/datasPt";
import type { TipoImportado } from "../importar-calendario";

export type TipoItemHoje = "aula" | "atividade" | "compromisso" | "calendario";

export type ItemHoje = {
  chave: string;
  tipo: TipoItemHoje;
  titulo: string;
  detalhe: string;
  data: string; // "AAAA-MM-DD"
  hora: string | null; // "HH:MM"
  atrasado: boolean;
  href: string;
};

export type EntradaHoje = {
  hoje: string;
  nomeTurma: Map<string, string>;
  aulas: { id: string; turma_id: string; data: string; titulo: string }[];
  horarios: { turma_id: string; dia_semana: number; hora_inicio: string }[];
  atividades: { id: string; titulo: string; prazo: string | null; turma: string }[];
  enviadas: Set<string>;
  compromissos: { id: string; titulo: string; data: string; hora: string | null; feito: boolean; tipo: string; materia: string }[];
  /** Textos no idioma de quem vê (padrão: português). */
  t?: TextosDatas;
  datasTurma: { id: string; turma_id: string; tipo: TipoImportado; titulo: string; data: string; ate: string | null; hora: string | null }[];
};


function diaDaSemana(data: string) {
  const [a, m, d] = data.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d)).getUTCDay();
}

function hhmm(hora: string | null) {
  return hora ? hora.slice(0, 5) : null;
}

/**
 * Atrasados primeiro (do mais antigo), depois os de hoje: com horário pela hora, sem horário no fim.
 * Atrasado é só o que dá para "fazer": atividade não enviada e compromisso não feito.
 * Aulas e datas do calendário que já passaram não voltam.
 */
export function agendaDeHoje(e: EntradaHoje): ItemHoje[] {
  const { hoje, nomeTurma, t = datasPt } = e;
  const itens: ItemHoje[] = [];

  const aulaHoje = new Set<string>();
  for (const a of e.aulas) {
    if (a.data !== hoje) continue;
    aulaHoje.add(a.turma_id);
    itens.push({
      chave: `aula-${a.id}`,
      tipo: "aula",
      titulo: a.titulo.trim() || "Aula",
      detalhe: nomeTurma.get(a.turma_id) ?? "",
      data: a.data,
      hora: null,
      atrasado: false,
      href: `/aluno/turmas/${a.turma_id}`,
    });
  }

  // Turmas sem aula hoje pelo calendário (feriado, recesso): a aula semanal não aparece.
  const semAula = new Set(
    e.datasTurma.filter((d) => d.tipo === "sem_aula" && d.data <= hoje && (d.ate ?? d.data) >= hoje).map((d) => d.turma_id),
  );
  const semana = diaDaSemana(hoje);
  for (const h of e.horarios) {
    if (h.dia_semana !== semana || aulaHoje.has(h.turma_id) || semAula.has(h.turma_id)) continue;
    itens.push({
      chave: `semanal-${h.turma_id}-${h.hora_inicio}`,
      tipo: "aula",
      titulo: t.aulaDaTurma,
      detalhe: nomeTurma.get(h.turma_id) ?? "",
      data: hoje,
      hora: hhmm(h.hora_inicio),
      atrasado: false,
      href: `/aluno/turmas/${h.turma_id}`,
    });
  }

  for (const a of e.atividades) {
    if (!a.prazo || a.prazo > hoje || e.enviadas.has(a.id)) continue;
    itens.push({
      chave: `atividade-${a.id}`,
      tipo: "atividade",
      titulo: a.titulo,
      detalhe: a.turma ? `${t.atividade} · ${a.turma}` : t.atividade,
      data: a.prazo,
      hora: null,
      atrasado: a.prazo < hoje,
      href: `/atividades/${a.id}`,
    });
  }

  for (const c of e.compromissos) {
    if (c.feito || c.data > hoje) continue;
    const tipo = (t.tiposCompromisso as Record<string, string>)[c.tipo] ?? t.compromisso;
    itens.push({
      chave: `compromisso-${c.id}`,
      tipo: "compromisso",
      titulo: c.titulo,
      detalhe: c.materia ? `${tipo} · ${c.materia}` : tipo,
      data: c.data,
      hora: hhmm(c.hora),
      atrasado: c.data < hoje,
      href: "/aluno/agenda",
    });
  }

  for (const d of e.datasTurma) {
    if (d.data > hoje || (d.ate ?? d.data) < hoje) continue;
    const turma = nomeTurma.get(d.turma_id);
    itens.push({
      chave: `calendario-${d.id}`,
      tipo: "calendario",
      titulo: d.titulo,
      detalhe: turma ? `${t.tiposCalendario[d.tipo]} · ${turma}` : t.tiposCalendario[d.tipo],
      data: hoje,
      hora: d.data === hoje ? hhmm(d.hora) : null,
      atrasado: false,
      href: "/aluno/agenda",
    });
  }

  return itens.sort((x, y) => {
    if (x.atrasado !== y.atrasado) return x.atrasado ? -1 : 1;
    if (x.data !== y.data) return x.data.localeCompare(y.data);
    if (x.hora && y.hora) return x.hora.localeCompare(y.hora);
    if (x.hora) return -1;
    if (y.hora) return 1;
    return x.titulo.localeCompare(y.titulo);
  });
}

/** "Atrasado · 03/11", "19:00" ou "Hoje". */
export function quandoItem(i: Pick<ItemHoje, "data" | "hora" | "atrasado">, t: TextosDatas = datasPt) {
  if (i.atrasado) {
    const [, m, d] = i.data.split("-");
    return fmt(t.atrasadoData, { data: `${d}/${m}` });
  }
  return i.hora ?? t.hoje;
}
