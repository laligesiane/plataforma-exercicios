import { novoId, type Exercicio, type ExercicioMultiplaEscolha, type ExercicioRelacionar } from "../atividades/modelo";
import { embaralhar } from "../embaralhar";
import { CARTOES_POR_RODADA, type Cartao } from "../documento/cartoes";
import {
  cartoesDeConceito,
  cartoesParaCompletar,
  montarComplete,
  montarQuiz,
  montarVerdadeiroFalso,
  pistaCurta,
  type Pergunta,
} from "../documento/jogos";

/**
 * Atividade montada dos cartões dos resumos, sem IA: usa os mesmos títulos e negritos dos jogos
 * e vira exercícios de verdade (os do editor), que o aluno salva, refaz e edita.
 */

export const tiposSemIa = {
  quiz: { nome: "Qual é o termo?", descricao: "Lê a explicação e escolhe o termo." },
  "verdadeiro-falso": { nome: "Verdadeiro ou falso", descricao: "A explicação é mesmo desse termo?" },
  complete: { nome: "Complete a frase", descricao: "Escolhe a palavra que falta." },
  ligar: { nome: "Relacionar", descricao: "Liga cada termo à explicação." },
} as const;
export type TipoSemIa = keyof typeof tiposSemIa;

export function ehTipoSemIa(v: unknown): v is TipoSemIa {
  return typeof v === "string" && v in tiposSemIa;
}

/** Itens por exercício. Nunca passa dos 10 cartões de uma rodada. */
export const QUANTIDADES_SEM_IA = [3, 5, 8] as const;

/** Quantos cartões cada tipo precisa para fazer sentido (o quiz precisa de alternativas erradas). */
const MINIMO: Record<TipoSemIa, number> = { quiz: 3, "verdadeiro-falso": 2, complete: 2, ligar: 3 };

/** Cartões que cada tipo usa. */
function cartoesDoTipo(tipo: TipoSemIa, cartoes: Cartao[]) {
  return tipo === "complete" ? cartoesParaCompletar(cartoes) : cartoesDeConceito(cartoes);
}

/** Quais tipos dá para montar com esses cartões. */
export function tiposPossiveis(cartoes: Cartao[]): TipoSemIa[] {
  return (Object.keys(tiposSemIa) as TipoSemIa[]).filter((t) => cartoesDoTipo(t, cartoes).length >= MINIMO[t]);
}

const aspas = (t: string) => `"${t}"`;

function multiplaEscolha(perguntas: Pergunta[], titulo: string, instrucoes: string): ExercicioMultiplaEscolha {
  return {
    id: novoId(),
    tipo: "multipla_escolha",
    titulo,
    instrucoes,
    itens: perguntas.map((p) => {
      const porque = p.explicacao.trim();
      return {
        id: novoId(),
        tipo: "multipla_escolha" as const,
        enunciado: p.enunciado,
        alternativas: p.opcoes.map((opcao, i) => ({
          id: `a${i + 1}`,
          texto: opcao,
          correta: opcao === p.certa,
          explicacao:
            opcao === p.certa
              ? `Isso! ${porque}`
              : `Não é ${aspas(opcao)}. A resposta certa é ${aspas(p.certa)}: ${porque}`,
        })),
        explicacaoPadrao: `A resposta certa é ${aspas(p.certa)}: ${porque}`,
      };
    }),
  };
}

function verdadeiroOuFalso(cartoes: Cartao[], semente: string, quantidade: number): ExercicioMultiplaEscolha {
  return {
    id: novoId(),
    tipo: "multipla_escolha",
    titulo: "Verdadeiro ou falso",
    instrucoes: "A explicação é mesmo desse termo? Responda Verdadeiro ou Falso.",
    itens: montarVerdadeiroFalso(cartoes, semente)
      .slice(0, quantidade)
      .map((a) => {
        const certo = a.verdadeira
          ? `Verdadeiro: é isso mesmo que o resumo diz sobre ${aspas(a.termo)}.`
          : `Falso: essa explicação é de ${aspas(a.de)}. ${a.termo}, no resumo: ${a.explicacaoCerta}`;
        const errado = a.verdadeira
          ? `É verdadeiro. O resumo explica ${aspas(a.termo)} assim: ${a.explicacaoCerta}`
          : `É falso. Essa explicação é de ${aspas(a.de)}. ${a.termo}, no resumo: ${a.explicacaoCerta}`;
        return {
          id: novoId(),
          tipo: "multipla_escolha" as const,
          enunciado: `${a.termo}: ${a.explicacao}`,
          alternativas: [
            { id: "v", texto: "Verdadeiro", correta: a.verdadeira, explicacao: a.verdadeira ? certo : errado },
            { id: "f", texto: "Falso", correta: !a.verdadeira, explicacao: a.verdadeira ? errado : certo },
          ],
          explicacaoPadrao: errado,
        };
      }),
  };
}

function relacionar(cartoes: Cartao[], semente: string, quantidade: number): ExercicioRelacionar {
  // Duas explicações iguais deixariam o par ambíguo: fica só a primeira.
  const vistas = new Set<string>();
  const pares = embaralhar(cartoes, semente).filter((c) => {
    const direita = pistaCurta(c).toLowerCase();
    if (!direita || vistas.has(direita)) return false;
    vistas.add(direita);
    return true;
  });
  return {
    id: novoId(),
    tipo: "relacionar",
    titulo: "Relacione",
    instrucoes: "Ligue cada termo à explicação certa.",
    itens: pares.slice(0, quantidade).map((c) => ({
      id: novoId(),
      tipo: "relacionar" as const,
      esquerda: c.frente,
      direita: pistaCurta(c),
      explicacao: `${c.frente}: ${c.verso}`,
    })),
  };
}

/**
 * Monta a atividade com os tipos pedidos, na ordem de `tiposSemIa`.
 * Tipos sem cartões suficientes ficam de fora; cada exercício usa no máximo 10 cartões.
 */
export function montarAtividadeSemIa(
  cartoes: Cartao[],
  opcoes: { tipos: TipoSemIa[]; quantidade: number; semente: string },
): Exercicio[] {
  const quantidade = Math.min(Math.max(1, Math.floor(opcoes.quantidade) || 5), CARTOES_POR_RODADA);
  const { semente } = opcoes;
  const pedidos = (Object.keys(tiposSemIa) as TipoSemIa[]).filter((t) => opcoes.tipos.includes(t));
  const exercicios: Exercicio[] = [];

  for (const tipo of pedidos) {
    const uteis = cartoesDoTipo(tipo, cartoes);
    if (uteis.length < MINIMO[tipo]) continue;
    // Sorteia até 10 cartões; as alternativas erradas saem desses mesmos cartões.
    const rodada = embaralhar(uteis, `${semente}:${tipo}`).slice(0, CARTOES_POR_RODADA);
    if (tipo === "quiz") {
      exercicios.push(
        multiplaEscolha(montarQuiz(rodada, semente).slice(0, quantidade), "Qual é o termo?", "Leia a explicação e escolha o termo certo."),
      );
    } else if (tipo === "complete") {
      exercicios.push(
        multiplaEscolha(montarComplete(rodada, semente).slice(0, quantidade), "Complete a frase", "Escolha a palavra que falta na frase."),
      );
    } else if (tipo === "verdadeiro-falso") {
      exercicios.push(verdadeiroOuFalso(rodada, semente, quantidade));
    } else {
      const ex = relacionar(rodada, semente, quantidade);
      if (ex.itens.length >= 2) exercicios.push(ex);
    }
  }
  return exercicios.filter((e) => e.itens.length > 0);
}

/** Junta os cartões de vários resumos sem repetir termo e com ids únicos. */
export function juntarCartoes(listas: Cartao[][]): Cartao[] {
  const vistos = new Set<string>();
  const saida: Cartao[] = [];
  listas.forEach((lista, i) => {
    for (const c of lista) {
      const chave = c.frente.toLowerCase();
      if (vistos.has(chave)) continue;
      vistos.add(chave);
      saida.push({ ...c, id: `r${i + 1}-${c.id}` });
    }
  });
  return saida;
}
