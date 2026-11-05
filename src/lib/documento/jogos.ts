import { embaralhar } from "../embaralhar";
import { esconderTermo, type Cartao } from "./cartoes";

/**
 * Jogos rápidos montados dos cartões do resumo, sem IA e sem salvar nada.
 * Tudo aqui é sorteado com semente, para o servidor e o navegador montarem igual.
 */

export type ModoJogo = "cartoes" | "memoria" | "quiz" | "complete" | "verdadeiro-falso" | "ligar";

export type InfoJogo = { modo: ModoJogo; nome: string; descricao: string; minimo: number };

export const jogos: InfoJogo[] = [
  { modo: "cartoes", nome: "Cartões", descricao: "Vire o cartão e diga se sabia.", minimo: 1 },
  { modo: "memoria", nome: "Jogo da memória", descricao: "Ache os pares de termo e explicação.", minimo: 3 },
  { modo: "quiz", nome: "Quiz", descricao: "Leia a pista e escolha o termo certo.", minimo: 3 },
  { modo: "complete", nome: "Complete a frase", descricao: "Escolha a palavra que falta na frase.", minimo: 2 },
  { modo: "verdadeiro-falso", nome: "Verdadeiro ou falso", descricao: "A explicação combina com o termo?", minimo: 2 },
  { modo: "ligar", nome: "Ligar pares", descricao: "Ligue cada termo à explicação, contra o relógio.", minimo: 3 },
];

export const infoDoJogo = (modo: string) => jogos.find((j) => j.modo === modo);

/** Encurta para caber num quadradinho ou botão. */
export function resumir(texto: string, limite: number): string {
  const limpo = texto.replace(/\s+/g, " ").trim();
  if (limpo.length <= limite) return limpo;
  const corte = limpo.slice(0, limite - 1);
  const espaco = corte.lastIndexOf(" ");
  return `${(espaco > limite * 0.6 ? corte.slice(0, espaco) : corte).trimEnd()}…`;
}

/**
 * A primeira frase inteira do texto, sem cortar no meio. Serve para caber nos quadradinhos
 * do jogo da memória e do ligar pares sem aparecer "…". Se a frase for longa, vem inteira mesmo assim.
 */
export function primeiraFrase(texto: string): string {
  const linha = texto.split("\n").map((l) => l.trim()).find(Boolean) ?? "";
  const fim = linha.search(/[.!?…](\s|$)/);
  return (fim >= 0 ? linha.slice(0, fim + 1) : linha).replace(/\s+/g, " ").trim();
}

/** A pista de um cartão: o verso inteiro sem o termo. */
export const pistaDe = (c: Cartao) => esconderTermo(c).replace(/[ \t]+/g, " ").trim();

/** A pista curta: só a primeira frase, inteira. */
export const pistaCurta = (c: Cartao) => primeiraFrase(esconderTermo(c));

/** Cartões que servem para "Complete a frase": negritos cuja frase traz o termo. */
export function cartoesParaCompletar(cartoes: Cartao[]): Cartao[] {
  return cartoes.filter((c) => c.frase && c.frase.toLowerCase().includes(c.frente.toLowerCase()));
}

/** Cartões de termo e explicação. As lacunas (negrito no meio da frase) não entram: não são definições. */
export const cartoesDeConceito = (cartoes: Cartao[]) => cartoes.filter((c) => c.tipo !== "lacuna");

/** Os cartões que cada jogo usa. */
export function cartoesDoJogo(modo: ModoJogo, cartoes: Cartao[]): Cartao[] {
  if (modo === "complete") return cartoesParaCompletar(cartoes);
  if (modo === "cartoes") return cartoes;
  return cartoesDeConceito(cartoes);
}

/** Quantos cartões cada jogo consegue usar, para a tela inicial saber o que mostrar. */
export const cartoesUteis = (modo: ModoJogo, cartoes: Cartao[]) => cartoesDoJogo(modo, cartoes).length;

// ---------- Jogo da memória ----------

export type Peca = { id: string; par: string; texto: string; lado: "termo" | "explicacao" };

export const PARES_NA_MEMORIA = 6;

export function montarMemoria(cartoes: Cartao[], semente: string, pares = PARES_NA_MEMORIA): Peca[] {
  const escolhidos = embaralhar(cartoes, `${semente}:escolha`).slice(0, pares);
  const pecas = escolhidos.flatMap((c): Peca[] => [
    { id: `${c.id}-t`, par: c.id, texto: c.frente, lado: "termo" },
    { id: `${c.id}-e`, par: c.id, texto: pistaCurta(c), lado: "explicacao" },
  ]);
  return embaralhar(pecas, semente);
}

// ---------- Quiz e Complete a frase ----------

export type Pergunta = { id: string; enunciado: string; opcoes: string[]; certa: string; explicacao: string };

/** Até 3 termos de outros cartões, sem repetir o certo. */
function distratores(certo: Cartao, todos: Cartao[], semente: string, quantos = 3): string[] {
  const vistos = new Set([certo.frente.toLowerCase()]);
  const saida: string[] = [];
  for (const c of embaralhar(todos, `${semente}:${certo.id}`)) {
    const chave = c.frente.toLowerCase();
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    saida.push(c.frente);
    if (saida.length === quantos) break;
  }
  return saida;
}

export function montarQuiz(cartoes: Cartao[], semente: string): Pergunta[] {
  return embaralhar(cartoes, semente).map((c) => ({
    id: c.id,
    enunciado: pistaDe(c),
    opcoes: embaralhar([c.frente, ...distratores(c, cartoes, semente)], `${semente}:op:${c.id}`),
    certa: c.frente,
    explicacao: c.verso,
  }));
}

export function montarComplete(cartoes: Cartao[], semente: string): Pergunta[] {
  const usaveis = cartoesParaCompletar(cartoes);
  return embaralhar(usaveis, semente).map((c) => ({
    id: c.id,
    enunciado: esconderTermo({ frente: c.frente, verso: c.frase ?? c.verso }, "_____"),
    // Os distratores vêm dos outros termos em negrito, que são palavras do mesmo tamanho de ideia.
    opcoes: embaralhar([c.frente, ...distratores(c, usaveis.length >= 3 ? usaveis : cartoes, semente, 2)], `${semente}:op:${c.id}`),
    certa: c.frente,
    explicacao: c.frase ?? c.verso,
  }));
}

// ---------- Verdadeiro ou falso ----------

/** "de" é o termo dono da explicação mostrada (o próprio termo quando a afirmação é verdadeira). */
export type Afirmacao = { id: string; termo: string; explicacao: string; verdadeira: boolean; explicacaoCerta: string; de: string };

/** Metade (mais ou menos) das afirmações troca a explicação pela de outro cartão. */
export function montarVerdadeiroFalso(cartoes: Cartao[], semente: string): Afirmacao[] {
  const ordem = embaralhar(cartoes, semente);
  return ordem.map((c, i) => {
    const outro = ordem[(i + 1) % ordem.length];
    const verdadeira = ordem.length < 2 || embaralhar([true, false], `${semente}:vf:${c.id}`)[0];
    const explicacao = verdadeira ? pistaDe(c) : pistaDe(outro);
    return { id: c.id, termo: c.frente, explicacao, verdadeira, explicacaoCerta: pistaDe(c), de: verdadeira ? c.frente : outro.frente };
  });
}

// ---------- Ligar pares ----------

export const PARES_POR_TELA = 5;

export type TelaLigar = { termos: { id: string; texto: string }[]; explicacoes: { id: string; texto: string }[] };

export function montarLigar(cartoes: Cartao[], semente: string, porTela = PARES_POR_TELA): TelaLigar[] {
  const ordem = embaralhar(cartoes, semente);
  const telas: TelaLigar[] = [];
  for (let i = 0; i < ordem.length; i += porTela) {
    let grupo = ordem.slice(i, i + porTela);
    // Uma tela com um par só não tem graça: junta com a anterior.
    if (grupo.length === 1 && telas.length > 0) {
      const ultima = telas.pop()!;
      grupo = [...ordem.slice(i - ultima.termos.length, i), ...grupo];
    }
    telas.push({
      termos: grupo.map((c) => ({ id: c.id, texto: c.frente })),
      explicacoes: embaralhar(
        grupo.map((c) => ({ id: c.id, texto: pistaCurta(c) })),
        `${semente}:tela${i}`,
      ),
    });
  }
  return telas;
}
