// Importar calendário acadêmico: lê datas de um .ics ou de um texto (colado ou tirado de um PDF).
// Tudo aqui é palpite: a pessoa sempre revisa a lista antes de salvar.

import { dataValida } from "../aulas";
import type { EventoUnico } from "../agenda/ics";

export type TipoImportado = "prova" | "entrega" | "aula" | "sem_aula" | "outro";

export type ItemImportado = {
  titulo: string;
  data: string; // "AAAA-MM-DD"
  ate: string | null; // último dia, quando é um período (férias, semana de provas)
  hora: string | null; // "HH:MM"
  tipo: TipoImportado;
};

export const tiposImportados: { valor: TipoImportado; rotulo: string }[] = [
  { valor: "prova", rotulo: "Prova" },
  { valor: "entrega", rotulo: "Entrega" },
  { valor: "aula", rotulo: "Aula" },
  { valor: "sem_aula", rotulo: "Sem aula (feriado, recesso)" },
  { valor: "outro", rotulo: "Outro" },
];

export const rotuloTipoImportado: Record<TipoImportado, string> = {
  prova: "Prova",
  entrega: "Entrega",
  aula: "Aula",
  sem_aula: "Sem aula",
  outro: "Outro",
};

/** No máximo isto de linhas por importação. */
export const MAX_ITENS = 300;

const semAcento = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Palpite do tipo pelo nome. A ordem importa: "Feriado, não haverá prova" é dia sem aula. */
export function adivinharTipo(titulo: string): TipoImportado {
  const t = semAcento(titulo);
  if (/feriado|recesso|ferias|sem aula|nao havera aula|ponto facultativo|carnaval|suspens/.test(t)) return "sem_aula";
  if (/prova|avaliac|exame|\bp[1-4]\b|\bav[1-4]\b|\bap[1-4]\b|\bteste\b|simulado|recuperac|\bvs\b/.test(t)) return "prova";
  if (/entrega|trabalho|seminario|\btcc\b|relatorio|projeto|tarefa|lista de exercicio|\bprazo\b/.test(t)) return "entrega";
  if (/\baulas?\b|semestre letivo|periodo letivo|ano letivo/.test(t)) return "aula";
  return "outro";
}

const dois = (n: number) => String(n).padStart(2, "0");
const montar = (a: number, m: number, d: number) => `${a}-${dois(m)}-${dois(d)}`;

export function somarDias(data: string, dias: number) {
  const [a, m, d] = data.split("-").map(Number);
  const dt = new Date(Date.UTC(a, m - 1, d + dias));
  return montar(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}

export function formatarCurta(data: string) {
  const [, m, d] = data.split("-");
  return `${d}/${m}`;
}

/** Remove repetidos (mesmo dia e mesmo nome) e corta no máximo. */
function limpar(itens: ItemImportado[]) {
  const vistos = new Set<string>();
  const saida: ItemImportado[] = [];
  for (const i of itens) {
    const chave = chaveItem(i);
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    saida.push(i);
  }
  return saida.sort((x, y) => x.data.localeCompare(y.data)).slice(0, MAX_ITENS);
}

/** Chave para achar repetidos: dia + nome sem acento, maiúscula ou espaços. */
export function chaveItem(i: { data: string; titulo: string }) {
  return `${i.data}|${semAcento(i.titulo).replace(/[^a-z0-9]/g, "")}`;
}

// ---------------------------------------------------------------- .ics

function desescapar(texto: string) {
  return texto.replace(/\\n/gi, " ").replace(/\\([,;\\])/g, "$1").trim();
}

/** Data de um DTSTART/DTEND. Horário em UTC ("Z") vira horário de Brasília. */
function lerDataIcs(valor: string, fuso: string): { data: string; hora: string | null } | null {
  const m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})\d{0,2}(Z)?)?$/.exec(valor.trim());
  if (!m) return null;
  const [, a, me, d, h, mi, z] = m;
  if (!h) return { data: `${a}-${me}-${d}`, hora: null };
  if (!z) return { data: `${a}-${me}-${d}`, hora: `${h}:${mi}` };
  const instante = new Date(Date.UTC(+a, +me - 1, +d, +h, +mi));
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: fuso,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instante);
  const p = (tipo: string) => partes.find((x) => x.type === tipo)?.value ?? "";
  return { data: `${p("year")}-${p("month")}-${p("day")}`, hora: `${p("hour")}:${p("minute")}` };
}

/** Lê os eventos de um arquivo .ics (Google Agenda, Outlook, sistema da faculdade). */
export function lerIcs(conteudo: string, fuso = "America/Sao_Paulo"): ItemImportado[] {
  // Linhas longas vêm "dobradas": a continuação começa com espaço ou tab.
  const linhas = conteudo.replace(/\r\n?/g, "\n").replace(/\n[ \t]/g, "").split("\n");
  const itens: ItemImportado[] = [];
  let atual: Record<string, string> | null = null;
  for (const linha of linhas) {
    if (/^BEGIN:VEVENT/i.test(linha)) atual = {};
    else if (/^END:VEVENT/i.test(linha) && atual) {
      const inicio = atual.DTSTART ? lerDataIcs(atual.DTSTART, fuso) : null;
      if (inicio && dataValida(inicio.data) && !/CANCELLED/i.test(atual.STATUS ?? "")) {
        let ate: string | null = null;
        const fim = atual.DTEND ? lerDataIcs(atual.DTEND, fuso) : null;
        if (fim) {
          // Em evento de dia inteiro o DTEND é o dia seguinte ao último.
          const ultimo = fim.hora === null ? somarDias(fim.data, -1) : fim.data;
          if (ultimo > inicio.data) ate = ultimo;
        }
        const titulo = desescapar(atual.SUMMARY ?? "").slice(0, 200) || "Evento";
        itens.push({ titulo, data: inicio.data, ate, hora: inicio.hora, tipo: adivinharTipo(titulo) });
      }
      atual = null;
    } else if (atual) {
      const m = /^([A-Z-]+)(?:;[^:]*)?:(.*)$/i.exec(linha);
      if (m && !(m[1].toUpperCase() in atual)) atual[m[1].toUpperCase()] = m[2];
    }
  }
  return limpar(itens);
}

// ---------------------------------------------------------------- texto

const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const nomeMes = "(janeiro|fevereiro|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro|jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\\.?";
const numeroMes = (nome: string) => meses.indexOf(nome.slice(0, 3)) + 1;

// Datas que a gente reconhece (texto já sem acento e em minúsculas). Os períodos vêm antes para ganhar a disputa.
// O traço só liga um período quando o número antes dele não é parte do nome ("Prova 2 - 10/04" é um dia só).
const ligacao = "((?:a|ate|ao|e)(?=\\s)|(?<![a-z]\\s*\\d{1,2}\\s*)[-–])";
const reData = new RegExp(
  [
    `\\b(\\d{1,2})\\s*${ligacao}\\s*(\\d{1,2})\\s*/\\s*(\\d{1,2})(?:\\s*/\\s*(\\d{4}|\\d{2}))?(?![\\d/])`, // 15 a 20/03
    `\\b(\\d{1,2})\\s*${ligacao}\\s*(\\d{1,2})\\s+de\\s+${nomeMes}(?:\\s*(?:de\\s+)?(\\d{4}))?\\b`, // 15 a 20 de março
    "\\b(\\d{4})-(\\d{2})-(\\d{2})\\b", // 2026-03-15
    "\\b(\\d{1,2})\\s*[/.]\\s*(\\d{1,2})(?:\\s*[/.]\\s*(\\d{4}|\\d{2}))?(?![\\d/])", // 15/03, 15/03/2026, 15.03.26
    `\\b(\\d{1,2})(?:o|º|°)?\\s*(?:de\\s+)?${nomeMes}(?:\\s*(?:de\\s+|/\\s*)?(\\d{4}))?\\b`, // 15 de março de 2026, 15 mar
  ].join("|"),
  "g",
);

type DataAchada = {
  inicio: number;
  fim: number;
  dia: number;
  mes: number;
  ano: number | null;
  /** "15 a 20/03": último dia do período. "10 e 12/03": segundo dia, separado. */
  outroDia?: number;
  separado?: boolean;
};

const anoDe = (t: string | undefined) => (t ? (t.length === 2 ? 2000 + +t : +t) : null);

function acharDatas(linha: string): DataAchada[] {
  const achadas: DataAchada[] = [];
  for (const m of linha.matchAll(reData)) {
    const base = { inicio: m.index!, fim: m.index! + m[0].length };
    let d: DataAchada;
    if (m[1]) d = { ...base, dia: +m[1], outroDia: +m[3], separado: m[2] === "e", mes: +m[4], ano: anoDe(m[5]) };
    else if (m[6]) d = { ...base, dia: +m[6], outroDia: +m[8], separado: m[7] === "e", mes: numeroMes(m[9]), ano: anoDe(m[10]) };
    else if (m[11]) d = { ...base, ano: +m[11], mes: +m[12], dia: +m[13] };
    else if (m[14]) d = { ...base, dia: +m[14], mes: +m[15], ano: anoDe(m[16]) };
    else d = { ...base, dia: +m[17], mes: numeroMes(m[18]), ano: anoDe(m[19]) };
    if (d.dia < 1 || d.dia > 31 || d.mes < 1 || d.mes > 12) continue;
    achadas.push(d);
  }
  return achadas;
}

const reDiaSemana =
  /\b(segunda|terca|quarta|quinta|sexta)(-feira)?\b|\b(sabado|domingo)\b|\((seg|ter|qua|qui|sex|sab|dom)\.?\)|\b(seg|ter|qua|qui|sex|sab|dom)\b\.?/g;
const reHora = /\b(?:as\s+)?([01]?\d|2[0-3])\s*(?:h\s*([0-5]\d)?|:([0-5]\d))(?![\d])(?:\s*(?:min|hs?)\b)?/;
const reCabecalhoMes = new RegExp(`^\\W*${nomeMes}(?:\\s*(?:de\\s+|/\\s*)?(\\d{4}))?\\W*$`);
const reDiaNoComeco = /^\s*(\d{1,2})(?:\s*(a|ate|ao|-|–|e)\s*(\d{1,2}))?\s*(?:[-–:.)|]\s*|\s+)(?=[a-z])/;
const reAnoSolto = /\b(20\d{2})\b/;

/** Troca por espaço os pedaços indicados (posições valem no original e na versão sem acento). */
function cortar(texto: string, pedacos: [number, number][]) {
  let t = texto;
  for (const [i, f] of [...pedacos].sort((a, b) => b[0] - a[0])) t = t.slice(0, i) + " ".repeat(f - i) + t.slice(f);
  return t;
}

function arrumarTitulo(texto: string) {
  return texto
    .replace(/\(\s*\)/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^[\s\-–—:;,.|•*>)\]]+|[\s\-–—:;,|•*(\[]+$/g, "")
    .trim()
    .slice(0, 200);
}

/** Tira horário e dia da semana do trecho; devolve o nome limpo e a hora, se houver. */
function tituloEHora(trecho: string, trechoBaixo: string) {
  let hora: string | null = null;
  let t = trecho;
  let tb = trechoBaixo;
  const h = reHora.exec(tb);
  if (h) {
    hora = `${dois(+h[1])}:${h[2] ?? h[3] ?? "00"}`;
    t = cortar(t, [[h.index, h.index + h[0].length]]);
    tb = cortar(tb, [[h.index, h.index + h[0].length]]);
  }
  const dias: [number, number][] = [...tb.matchAll(reDiaSemana)].map((x) => [x.index!, x.index! + x[0].length]);
  return { titulo: arrumarTitulo(cortar(t, dias)), hora };
}

/**
 * Lê datas de um texto livre: calendário colado de um site, de um PDF ou digitado.
 * Entende "15/03 - Prova 1", "15 de março: Início das aulas", "15 a 20/03 Semana de provas",
 * e listas com o mês num título ("MARÇO 2026" e depois "15 - Prova").
 * Sem ano escrito, usa o ano que aparecer no texto (ex.: "Calendário 2027") ou o mais próximo de hoje.
 */
export function lerTexto(texto: string, hoje: string): ItemImportado[] {
  const [anoHoje] = hoje.split("-").map(Number);
  const linhas = texto
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .replace(/[\t|]+/g, " - ")
    .split("\n")
    .filter((l) => l.trim());

  // "Calendário Acadêmico 2027" numa linha sem data: vale como ano das datas sem ano.
  let anoDoTexto: number | null = null;
  for (const l of linhas) {
    const m = reAnoSolto.exec(l);
    if (m && acharDatas(semAcento(l)).length === 0) {
      anoDoTexto = +m[1];
      break;
    }
  }

  const limite = somarDias(hoje, -60);
  let ultimaData: string | null = null;
  const dataCom = (dia: number, mes: number, ano: number | null) => {
    if (ano) return montar(ano, mes, dia);
    if (anoDoTexto) {
      // Calendário que vira o ano (agosto → fevereiro): volta no mês, passa para o ano seguinte.
      let a = anoDoTexto;
      if (ultimaData && montar(a, mes, dia) < somarDias(ultimaData, -60)) a += 1;
      return montar(a, mes, dia);
    }
    let a = montar(anoHoje, mes, dia) < limite ? anoHoje + 1 : anoHoje;
    if (ultimaData && montar(a, mes, dia) < somarDias(ultimaData, -60)) a += 1;
    return montar(a, mes, dia);
  };

  const itens: ItemImportado[] = [];
  const adicionar = (titulo: string, data: string, ate: string | null, hora: string | null) => {
    if (!dataValida(data)) return;
    if (ate && (!dataValida(ate) || ate <= data)) ate = null;
    itens.push({ titulo: titulo || "Evento", data, ate, hora, tipo: adivinharTipo(titulo) });
    ultimaData = data;
  };
  let mesAtual: { mes: number; ano: number | null } | null = null;

  for (const original of linhas) {
    const baixa = semAcento(original);
    if (baixa.length !== original.length) continue; // caractere que muda de tamanho: pula para não errar o corte

    const cabecalho = reCabecalhoMes.exec(baixa.trim());
    if (cabecalho) {
      mesAtual = { mes: numeroMes(cabecalho[1]), ano: cabecalho[2] ? +cabecalho[2] : null };
      continue;
    }

    let datas = acharDatas(baixa);
    // Lista dentro de um mês: "15 - Prova 1" ou "15 a 20 Semana de provas".
    if (datas.length === 0 && mesAtual) {
      const m = reDiaNoComeco.exec(baixa);
      if (m) {
        datas = [
          {
            inicio: 0,
            fim: m[0].length,
            dia: +m[1],
            mes: mesAtual.mes,
            ano: mesAtual.ano,
            outroDia: m[3] ? +m[3] : undefined,
            separado: m[2] === "e",
          },
        ];
      }
    }
    if (datas.length === 0) continue;

    // "15/03 a 20/03": duas datas ligadas só por "a", "até" ou "-" viram um período.
    if (datas.length === 2 && /^\s*(a|ate|ao|-|–)\s*$/.test(baixa.slice(datas[0].fim, datas[1].inicio))) {
      const [a, b] = datas;
      const inicio = dataCom(a.dia, a.mes, a.ano ?? b.ano);
      const fim = dataCom(b.dia, b.mes, b.ano);
      const resto = tituloEHora(cortar(original, [[a.inicio, b.fim]]), cortar(baixa, [[a.inicio, b.fim]]));
      adicionar(resto.titulo, inicio, fim, resto.hora);
      continue;
    }

    if (datas.length === 1) {
      const d = datas[0];
      const { titulo, hora } = tituloEHora(cortar(original, [[d.inicio, d.fim]]), cortar(baixa, [[d.inicio, d.fim]]));
      const inicio = dataCom(d.dia, d.mes, d.ano);
      if (d.outroDia && d.separado) {
        adicionar(titulo, inicio, null, hora);
        adicionar(titulo, dataCom(d.outroDia, d.mes, d.ano), null, hora);
      } else adicionar(titulo, inicio, d.outroDia ? dataCom(d.outroDia, d.mes, d.ano) : null, hora);
      continue;
    }

    // Várias datas soltas na mesma linha ("P1: 10/04, P2: 15/05"): cada uma pega o texto ao lado.
    const textoAntes = /[a-z]/.test(baixa.slice(0, datas[0].inicio));
    datas.forEach((d, i) => {
      const [ini, fim] = textoAntes
        ? [i === 0 ? 0 : datas[i - 1].fim, d.inicio]
        : [d.fim, i + 1 < datas.length ? datas[i + 1].inicio : original.length];
      const { titulo, hora } = tituloEHora(original.slice(ini, fim), baixa.slice(ini, fim));
      adicionar(titulo, dataCom(d.dia, d.mes, d.ano), d.outroDia && !d.separado ? dataCom(d.outroDia, d.mes, d.ano) : null, hora);
    });
  }
  return limpar(itens);
}

/** Decide pelo conteúdo: se parece .ics, lê como .ics; senão, como texto. */
export function lerCalendario(conteudo: string, hoje: string) {
  return /BEGIN:VCALENDAR/i.test(conteudo) ? lerIcs(conteudo) : lerTexto(conteudo, hoje);
}

/** Valida o que volta da tela de revisão (vem do navegador, então confere tudo de novo). */
export function validarItensImportados(entrada: unknown): { itens: ItemImportado[] } | { erro: string } {
  if (!Array.isArray(entrada) || entrada.length === 0) return { erro: "Escolha ao menos uma data para salvar." };
  if (entrada.length > MAX_ITENS) return { erro: `Dá para salvar até ${MAX_ITENS} datas de uma vez.` };
  const itens: ItemImportado[] = [];
  for (const [n, bruto] of entrada.entries()) {
    const i = (bruto ?? {}) as Record<string, unknown>;
    const linha = `Linha ${n + 1}`;
    const titulo = String(i.titulo ?? "").trim();
    if (!titulo) return { erro: `${linha}: escreva o nome.` };
    if (titulo.length > 200) return { erro: `${linha}: o nome pode ter até 200 caracteres.` };
    const data = String(i.data ?? "");
    if (!dataValida(data)) return { erro: `${linha}: escolha o dia.` };
    let ate: string | null = i.ate ? String(i.ate) : null;
    if (ate && !dataValida(ate)) return { erro: `${linha}: o "até" não é uma data válida.` };
    if (ate && ate <= data) ate = null;
    let hora: string | null = null;
    if (i.hora) {
      const m = /^([01]\d|2[0-3]):([0-5]\d)/.exec(String(i.hora));
      if (!m) return { erro: `${linha}: horário inválido.` };
      hora = `${m[1]}:${m[2]}`;
    }
    const tipo = String(i.tipo ?? "outro") as TipoImportado;
    if (!(tipo in rotuloTipoImportado)) return { erro: `${linha}: escolha o tipo.` };
    itens.push({ titulo, data, ate, hora, tipo });
  }
  return { itens };
}

// ---------------------------------------------------------------- destinos

/** Na agenda pessoal do aluno, o tipo vira um dos tipos de compromisso. */
export const tipoDoCompromisso: Record<TipoImportado, "tarefa" | "prova" | "aula" | "outro"> = {
  prova: "prova",
  entrega: "tarefa",
  aula: "aula",
  sem_aula: "outro",
  outro: "outro",
};

/** O compromisso não tem "até": o período vai no nome, como "Férias (até 31/07)". */
export function tituloComPeriodo(i: Pick<ItemImportado, "titulo" | "ate">) {
  return (i.ate ? `${i.titulo} (até ${formatarCurta(i.ate)})` : i.titulo).slice(0, 200);
}

/** Data do calendário de uma turma (tabela data_turma). */
export type DataTurma = ItemImportado & { id: string; turma_id: string };

export const camposDataTurma = "id, turma_id, tipo, titulo, data, ate, hora";

/** Datas que ainda importam: as de hoje em diante e os períodos que ainda não acabaram. */
export function datasPelaFrente<T extends Pick<ItemImportado, "data" | "ate">>(datas: T[], hoje: string) {
  return datas.filter((d) => (d.ate ?? d.data) >= hoje).sort((a, b) => a.data.localeCompare(b.data));
}

/** "15/03" ou "15/03 a 20/03", com horário se tiver. */
export function quandoTexto(i: Pick<ItemImportado, "data" | "ate" | "hora">) {
  const dia = i.ate ? `${formatarCurta(i.data)} a ${formatarCurta(i.ate)}` : formatarCurta(i.data);
  return i.hora ? `${dia} às ${i.hora.slice(0, 5)}` : dia;
}

/** Data da turma como evento do .ics. Período sem horário vira um evento de vários dias. */
export function eventoDaDataTurma(d: DataTurma, nomeTurma: string): EventoUnico {
  return {
    id: `data-turma-${d.id}`,
    titulo: `${rotuloTipoImportado[d.tipo]}: ${d.titulo} (${nomeTurma})`,
    descricao: `Calendário da turma ${nomeTurma} na Repasa`,
    data: d.data,
    ate: d.hora ? null : d.ate,
    hora: d.hora,
    duracao_min: 60,
  };
}
