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
export function fraseDoBrotinho(diasNaSemana: number, sequencia: number, estudouHoje: boolean) {
  if (diasNaSemana >= META_SEMANA) return sequencia >= 5 ? `${sequencia} dias seguidos! Estou virando árvore.` : "Meta da semana cumprida! Cresci mais um pouco.";
  if (estudouHoje) return `Hoje já contou. Faltam ${META_SEMANA - diasNaSemana} ${META_SEMANA - diasNaSemana === 1 ? "dia" : "dias"} para a meta da semana.`;
  if (sequencia > 0) return `Sequência de ${sequencia} ${sequencia === 1 ? "dia" : "dias"}. Estude hoje para continuar.`;
  return "Que tal estudar um pouquinho hoje? Eu cresço junto com você.";
}
