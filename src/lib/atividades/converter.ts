import { embaralhar } from "../embaralhar";
import {
  novoExercicio,
  novoId,
  type Exercicio,
  type ExercicioArrastar,
  type ExercicioLacuna,
  type ExercicioMultiplaEscolha,
  type TipoExercicio,
} from "./modelo";

/** Para quais tipos cada exercício pode virar, reaproveitando o conteúdo. */
export const conversoes: Partial<Record<TipoExercicio, TipoExercicio[]>> = {
  lacuna: ["arrastar", "multipla_escolha"],
  arrastar: ["lacuna", "multipla_escolha"],
  multipla_escolha: ["lacuna", "arrastar"],
  relacionar: ["multipla_escolha"],
};

type Base = { enunciado: string; certa: string; erros: { valor: string; explicacao: string }[]; explicacaoPadrao: string };

/** Conteúdo comum a todos os itens: pergunta, resposta certa e erros previstos com explicação. */
function bases(e: Exercicio): Base[] {
  switch (e.tipo) {
    case "lacuna":
      return e.itens.map((i) => ({ enunciado: i.enunciado, certa: i.aceitas[0] ?? "", erros: i.errosPrevistos, explicacaoPadrao: i.explicacaoPadrao }));
    case "arrastar":
      return e.itens.map((i) => ({ enunciado: i.enunciado, certa: i.resposta, erros: i.errosPrevistos, explicacaoPadrao: i.explicacaoPadrao }));
    case "multipla_escolha":
      return e.itens.map((i) => ({
        enunciado: i.enunciado,
        certa: i.alternativas.find((a) => a.correta)?.texto ?? "",
        erros: i.alternativas.filter((a) => !a.correta).map((a) => ({ valor: a.texto, explicacao: a.explicacao ?? "" })),
        explicacaoPadrao: i.explicacaoPadrao,
      }));
    case "relacionar":
      return e.itens.map((i) => ({ enunciado: i.esquerda, certa: i.direita, erros: [], explicacaoPadrao: i.explicacao }));
    default:
      return [];
  }
}

/**
 * Cria um exercício novo, de outro tipo, com o mesmo conteúdo.
 * Na múltipla escolha, os erros previstos viram alternativas erradas (com a explicação de cada uma);
 * faltando alternativas, entram as respostas dos outros itens.
 */
export function converterExercicio(e: Exercicio, tipo: TipoExercicio, semente: string = novoId()): Exercicio | null {
  const sortear = <T,>(l: T[]) => embaralhar(l, semente + l.length);
  if (!conversoes[e.tipo]?.includes(tipo)) return null;
  const itens = bases(e).filter((b) => b.enunciado.trim() && b.certa.trim());
  const base = novoExercicio(tipo);
  const comum = { ...base, titulo: e.titulo, instrucoes: base.instrucoes, ...(e.midia ? { midia: e.midia } : {}) };

  switch (tipo) {
    case "lacuna":
      return {
        ...comum,
        tipo,
        itens: itens.map((b) => ({
          id: novoId(),
          tipo,
          enunciado: b.enunciado,
          aceitas: [b.certa],
          errosPrevistos: b.erros.filter((x) => x.valor.trim()),
          explicacaoPadrao: b.explicacaoPadrao,
          grafiaExata: false,
        })),
      } as ExercicioLacuna;
    case "arrastar":
      return {
        ...comum,
        tipo,
        palavrasExtras: [],
        itens: itens.map((b) => ({
          id: novoId(),
          tipo,
          enunciado: b.enunciado,
          resposta: b.certa,
          errosPrevistos: b.erros.filter((x) => x.valor.trim()),
          explicacaoPadrao: b.explicacaoPadrao,
        })),
      } as ExercicioArrastar;
    case "multipla_escolha": {
      const respostas = [...new Set(itens.map((b) => b.certa.trim()))];
      return {
        ...comum,
        tipo,
        itens: itens.map((b) => {
          const erradas = b.erros.filter((x) => x.valor.trim() && x.valor.trim() !== b.certa.trim()).slice(0, 3);
          const usadas = new Set([b.certa.trim(), ...erradas.map((x) => x.valor.trim())]);
          const outras = sortear(respostas.filter((r) => !usadas.has(r))).slice(0, Math.max(0, 2 - erradas.length));
          const alternativas = sortear([
            { id: novoId(), texto: b.certa, correta: true },
            ...erradas.map((x) => ({ id: novoId(), texto: x.valor, correta: false, ...(x.explicacao ? { explicacao: x.explicacao } : {}) })),
            ...outras.map((texto) => ({ id: novoId(), texto, correta: false })),
          ]);
          return { id: novoId(), tipo, enunciado: b.enunciado, alternativas, explicacaoPadrao: b.explicacaoPadrao };
        }),
      } as ExercicioMultiplaEscolha;
    }
    default:
      return null;
  }
}
