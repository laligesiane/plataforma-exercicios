import { normalizarBasico, normalizarGrafia } from "./normalizar";
import type {
  Item,
  ItemArrastar,
  ItemClassificar,
  ItemLacuna,
  ItemMultiplaEscolha,
  ItemRelacionar,
  Resultado,
} from "./tipos";

export function corrigirLacuna(item: ItemLacuna, resposta: string): Resultado {
  const basica = normalizarBasico(resposta);
  if (basica === "") {
    return { status: "errado", explicacao: item.explicacaoPadrao };
  }

  if (item.aceitas.some((aceita) => normalizarBasico(aceita) === basica)) {
    return { status: "certo" };
  }

  const grafia = normalizarGrafia(resposta);
  const aceitaParecida = item.aceitas.find((aceita) => normalizarGrafia(aceita) === grafia);
  if (aceitaParecida) {
    const aviso = `A grafia correta é "${aceitaParecida}".`;
    return item.grafiaExata
      ? { status: "errado", explicacao: aviso, aviso, grafia: aceitaParecida }
      : { status: "certo_com_aviso", aviso, grafia: aceitaParecida };
  }

  const erro =
    item.errosPrevistos.find((e) => normalizarBasico(e.valor) === basica) ??
    item.errosPrevistos.find((e) => normalizarGrafia(e.valor) === grafia);
  if (erro) {
    return { status: "errado", explicacao: erro.explicacao };
  }

  return { status: "errado", explicacao: item.explicacaoPadrao };
}

export function corrigirMultiplaEscolha(item: ItemMultiplaEscolha, idEscolhido: string): Resultado {
  const escolhida = item.alternativas.find((a) => a.id === idEscolhido);
  if (!escolhida) {
    return { status: "errado", explicacao: item.explicacaoPadrao };
  }
  if (escolhida.correta) {
    return { status: "certo", explicacao: escolhida.explicacao };
  }
  return { status: "errado", explicacao: escolhida.explicacao ?? item.explicacaoPadrao };
}

/** A palavra arrastada vem do banco, então não há grafia a tolerar: compara sem maiúsculas e espaços. */
export function corrigirArrastar(item: ItemArrastar, palavra: string): Resultado {
  const dada = normalizarBasico(palavra);
  if (dada === normalizarBasico(item.resposta)) return { status: "certo" };
  const erro = item.errosPrevistos.find((e) => normalizarBasico(e.valor) === dada);
  return { status: "errado", explicacao: erro?.explicacao ?? item.explicacaoPadrao };
}

export function corrigirClassificar(item: ItemClassificar, colunaId: string): Resultado {
  return colunaId === item.colunaId
    ? { status: "certo" }
    : { status: "errado", explicacao: item.explicacao };
}

/**
 * A resposta é o texto da direita que o aluno ligou. Compara o texto (e não o id do par)
 * para aceitar quando dois pares têm a mesma direita.
 */
export function corrigirRelacionar(item: ItemRelacionar, direita: string): Resultado {
  return normalizarBasico(direita) === normalizarBasico(item.direita)
    ? { status: "certo" }
    : { status: "errado", explicacao: item.explicacao };
}

export function corrigir(item: Item, resposta: string): Resultado {
  switch (item.tipo) {
    case "lacuna":
      return corrigirLacuna(item, resposta);
    case "multipla_escolha":
      return corrigirMultiplaEscolha(item, resposta);
    case "arrastar":
      return corrigirArrastar(item, resposta);
    case "classificar":
      return corrigirClassificar(item, resposta);
    case "relacionar":
      return corrigirRelacionar(item, resposta);
  }
}

/** "Ver resposta" aparece depois deste número de tentativas erradas no item. */
export const TENTATIVAS_ANTES_DE_VER_RESPOSTA = 1;

export function podeVerResposta(tentativasErradas: number, limite = TENTATIVAS_ANTES_DE_VER_RESPOSTA): boolean {
  return tentativasErradas >= limite;
}

export function respostaCorreta(item: Item): string {
  switch (item.tipo) {
    case "lacuna":
      return item.aceitas[0] ?? "";
    case "multipla_escolha":
      return item.alternativas.find((a) => a.correta)?.texto ?? "";
    case "arrastar":
      return item.resposta;
    case "classificar":
      return item.colunaId;
    case "relacionar":
      return item.direita;
  }
}
