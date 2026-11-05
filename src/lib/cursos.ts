// Contas do curso do aluno: quando termina e quanto já passou.

export type UnidadeDuracao = "meses" | "semestres" | "anos";

export const mesesPorUnidade: Record<UnidadeDuracao, number> = { meses: 1, semestres: 6, anos: 12 };

/** Converte "4 anos" em 48 meses. Devolve null se não der um número válido (1 a 240 meses). */
export function duracaoEmMeses(quantidade: unknown, unidade: unknown): number | null {
  const n = Number(String(quantidade ?? "").replace(",", "."));
  const fator = mesesPorUnidade[unidade as UnidadeDuracao];
  if (!fator || !Number.isFinite(n) || n <= 0) return null;
  const meses = Math.round(n * fator);
  return meses >= 1 && meses <= 240 ? meses : null;
}

/** Mostra a duração na unidade mais redonda: 48 → "4 anos", 18 → "3 semestres", 5 → "5 meses". */
export function descreverDuracao(meses: number): { quantidade: number; unidade: UnidadeDuracao; texto: string } {
  const [quantidade, unidade] =
    meses % 12 === 0 ? [meses / 12, "anos" as const] : meses % 6 === 0 ? [meses / 6, "semestres" as const] : [meses, "meses" as const];
  const singular = { anos: "ano", semestres: "semestre", meses: "mês" }[unidade];
  return { quantidade, unidade, texto: `${quantidade} ${quantidade === 1 ? singular : unidade}` };
}

/** Lê "2026-03-01" como data local (sem fuso). */
export function lerData(valor: string | null | undefined): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor ?? "");
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

export function somarMeses(data: Date, meses: number): Date {
  const d = new Date(data.getFullYear(), data.getMonth() + meses, 1);
  const ultimoDia = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(data.getDate(), ultimoDia));
  return d;
}

export type ProgressoCurso = {
  inicio: Date;
  fim: Date;
  /** 0 a 100, já arredondado. */
  porcentagem: number;
  situacao: "nao-comecou" | "andamento" | "terminou";
  /** "Faltam 2 anos e 3 meses", "Começa em 12 dias", "Terminou". */
  falta: string;
};

function plural(n: number, um: string, varios: string) {
  return `${n} ${n === 1 ? um : varios}`;
}

/** Tempo entre duas datas em texto curto: "2 anos e 3 meses", "5 meses", "12 dias". */
export function tempoEntre(de: Date, ate: Date): string {
  let meses = (ate.getFullYear() - de.getFullYear()) * 12 + ate.getMonth() - de.getMonth();
  if (ate.getDate() < de.getDate()) meses -= 1;
  if (meses < 1) {
    const dias = Math.max(1, Math.ceil((ate.getTime() - de.getTime()) / 86_400_000));
    return plural(dias, "dia", "dias");
  }
  const anos = Math.floor(meses / 12);
  const resto = meses % 12;
  if (anos === 0) return plural(resto, "mês", "meses");
  return resto === 0 ? plural(anos, "ano", "anos") : `${plural(anos, "ano", "anos")} e ${plural(resto, "mês", "meses")}`;
}

export function progressoCurso(
  inicioTexto: string | null | undefined,
  duracaoMeses: number | null | undefined,
  hoje: Date = new Date(),
): ProgressoCurso | null {
  const inicio = lerData(inicioTexto);
  if (!inicio || !duracaoMeses || duracaoMeses < 1) return null;
  const fim = somarMeses(inicio, duracaoMeses);
  const dia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

  if (dia < inicio) return { inicio, fim, porcentagem: 0, situacao: "nao-comecou", falta: `Começa em ${tempoEntre(dia, inicio)}` };
  if (dia >= fim) return { inicio, fim, porcentagem: 100, situacao: "terminou", falta: "Curso concluído" };

  const total = fim.getTime() - inicio.getTime();
  const porcentagem = Math.min(99, Math.max(0, Math.round(((dia.getTime() - inicio.getTime()) / total) * 100)));
  return { inicio, fim, porcentagem, situacao: "andamento", falta: `Faltam ${tempoEntre(dia, fim)}` };
}
