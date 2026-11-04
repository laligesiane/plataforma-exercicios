import { normalizarBasico, normalizarGrafia } from "./normalizar";
import type { Item, ItemLacuna, ItemMultiplaEscolha, Resultado } from "./tipos";

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
      ? { status: "errado", explicacao: aviso, aviso }
      : { status: "certo_com_aviso", aviso };
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

export function corrigir(item: Item, resposta: string): Resultado {
  return item.tipo === "lacuna" ? corrigirLacuna(item, resposta) : corrigirMultiplaEscolha(item, resposta);
}

/** "Ver resposta" aparece depois deste número de tentativas erradas no item. */
export const TENTATIVAS_ANTES_DE_VER_RESPOSTA = 1;

export function podeVerResposta(tentativasErradas: number, limite = TENTATIVAS_ANTES_DE_VER_RESPOSTA): boolean {
  return tentativasErradas >= limite;
}

export function respostaCorreta(item: Item): string {
  if (item.tipo === "lacuna") return item.aceitas[0] ?? "";
  return item.alternativas.find((a) => a.correta)?.texto ?? "";
}
