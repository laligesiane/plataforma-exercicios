import { fmt } from "../../i18n/config";
import { datasPt, type TextosDatas } from "../../i18n/dicionarios/datasPt";
import { hojeNoFuso } from "../aulas";
import { somarDias } from "../revisao";

/** Meta da semana: estudar em pelo menos 3 dias, sem cobrança de todo dia. */
export const META_SEMANA = 3;

/** Dias (AAAA-MM-DD, no fuso de São Paulo) em que houve alguma atividade de estudo. */
export function diasDeEstudo(momentos: string[], fuso = "America/Sao_Paulo") {
  return new Set(momentos.map((m) => hojeNoFuso(fuso, new Date(m))));
}

/** Dias seguidos estudando até hoje. Se hoje ainda não estudou, a sequência de ontem continua valendo. */
export function sequenciaAtual(dias: Set<string>, hoje: string) {
  let dia = dias.has(hoje) ? hoje : somarDias(hoje, -1);
  let total = 0;
  while (dias.has(dia)) {
    total++;
    dia = somarDias(dia, -1);
  }
  return total;
}

/** Os 7 dias da semana atual, de segunda a domingo, marcando os estudados. */
export function semanaAtual(dias: Set<string>, hoje: string) {
  const [a, m, d] = hoje.split("-").map(Number);
  const diaSemana = (new Date(Date.UTC(a, m - 1, d)).getUTCDay() + 6) % 7; // 0 = segunda
  const segunda = somarDias(hoje, -diaSemana);
  return Array.from({ length: 7 }, (_, i) => {
    const data = somarDias(segunda, i);
    return { data, estudou: dias.has(data), futuro: data > hoje, hoje: data === hoje };
  });
}

/** Frase do Brotinho conforme a semana. */
export function fraseDoBrotinho(diasNaSemana: number, sequencia: number, estudouHoje: boolean, t: TextosDatas["brotinho"] = datasPt.brotinho) {
  if (diasNaSemana >= META_SEMANA) return sequencia >= 5 ? fmt(t.arvore, { n: sequencia }) : t.meta;
  if (estudouHoje) return META_SEMANA - diasNaSemana === 1 ? t.jaContou1 : fmt(t.jaContouN, { n: META_SEMANA - diasNaSemana });
  if (sequencia > 0) return sequencia === 1 ? t.sequencia1 : fmt(t.sequenciaN, { n: sequencia });
  return t.convite;
}
