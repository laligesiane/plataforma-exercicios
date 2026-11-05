// Agenda pessoal do aluno: compromissos de fora da Repasa (funções puras).

import { dataValida } from "../aulas";
import type { EventoUnico } from "../agenda/ics";

export type TipoCompromisso = "tarefa" | "prova" | "aula" | "outro";

export type Compromisso = {
  id: string;
  tipo: TipoCompromisso;
  titulo: string;
  materia: string;
  data: string; // "AAAA-MM-DD"
  hora: string | null; // "HH:MM:SS"
  feito: boolean;
  nota: string;
  anotacao: string;
};

export const camposCompromisso = "id, tipo, titulo, materia, data, hora, feito, nota, anotacao";

export const tiposCompromisso: { valor: TipoCompromisso; rotulo: string }[] = [
  { valor: "tarefa", rotulo: "Tarefa para entregar" },
  { valor: "prova", rotulo: "Prova" },
  { valor: "aula", rotulo: "Aula" },
  { valor: "outro", rotulo: "Outro" },
];

export const rotuloTipo: Record<TipoCompromisso, string> = {
  tarefa: "Tarefa",
  prova: "Prova",
  aula: "Aula",
  outro: "Outro",
};

export type EntradaCompromisso = Omit<Compromisso, "id">;

/** Valida o formulário de compromisso. Devolve os dados limpos ou a mensagem de erro. */
export function validarCompromisso(campos: Record<string, string | undefined>): { compromisso: EntradaCompromisso } | { erro: string } {
  const limpo = (nome: string) => (campos[nome] ?? "").trim();

  const tipo = limpo("tipo") as TipoCompromisso;
  if (!(tipo in rotuloTipo)) return { erro: "Escolha o tipo." };

  const titulo = limpo("titulo");
  if (!titulo) return { erro: "Dê um nome ao compromisso." };
  if (titulo.length > 200) return { erro: "O nome pode ter até 200 caracteres." };

  const data = limpo("data");
  if (!dataValida(data)) return { erro: "Escolha o dia." };

  let hora: string | null = null;
  if (limpo("hora")) {
    const m = /^([01]\d|2[0-3]):([0-5]\d)/.exec(limpo("hora"));
    if (!m) return { erro: "Horário inválido." };
    hora = `${m[1]}:${m[2]}`;
  }

  const nota = limpo("nota");
  if (nota.length > 20) return { erro: "A nota pode ter até 20 caracteres." };

  return {
    compromisso: {
      tipo,
      titulo,
      materia: limpo("materia").slice(0, 100),
      data,
      hora,
      feito: campos.feito === "on" || campos.feito === "true",
      nota,
      anotacao: limpo("anotacao").slice(0, 2000),
    },
  };
}

const ordem = (a: Pick<Compromisso, "data" | "hora">, b: Pick<Compromisso, "data" | "hora">) =>
  a.data.localeCompare(b.data) || (a.hora ?? "99").localeCompare(b.hora ?? "99");

/**
 * "Pela frente": o que ainda não foi feito (inclusive atrasado) e o que é de hoje em diante.
 * "Já passou": feitos com data anterior a hoje, do mais recente para o mais antigo.
 */
export function separarCompromissos<T extends Pick<Compromisso, "data" | "hora" | "feito">>(itens: T[], hoje: string) {
  const pelaFrente = itens.filter((c) => !c.feito || c.data >= hoje).sort(ordem);
  const passados = itens.filter((c) => c.feito && c.data < hoje).sort((a, b) => ordem(b, a));
  return { pelaFrente, passados };
}

export function atrasado(c: Pick<Compromisso, "data" | "feito">, hoje: string) {
  return !c.feito && c.data < hoje;
}

/** Compromisso como evento do .ics: "✓" no título quando feito, nota e anotação na descrição. */
export function eventoDoCompromisso(c: Compromisso): EventoUnico {
  const titulo = `${c.feito ? "✓ " : ""}${rotuloTipo[c.tipo]}: ${c.titulo}${c.materia ? ` (${c.materia})` : ""}`;
  const descricao = [c.feito ? "Feito" : "", c.nota ? `Nota: ${c.nota}` : "", c.anotacao].filter(Boolean).join("\n");
  return { id: `compromisso-${c.id}`, titulo, descricao, data: c.data, hora: c.hora, duracao_min: 60 };
}
