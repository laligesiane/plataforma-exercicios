"use client";

import { createContext, useContext } from "react";
import type { TipoExercicio } from "@/lib/atividades/modelo";

/**
 * Textos de exemplo (placeholders) do editor de atividade. A atividade de idioma mostra exemplos em espanhol;
 * a de qualquer outra matéria, exemplos neutros, para o professor de Ciências não ver "iba" e "perro".
 */
export type Exemplos = {
  frase: string;
  resposta: string;
  erro: string;
  explicacaoErros: string;
  dica: string;
  pergunta: string;
  palavraExtra: string;
  colunas: [string, string];
  cartao: string;
  esquerda: string;
  direita: string;
  explicacaoPar: string;
  propostaEscrita: string;
  propostaOral: string;
  orientacao: string;
  legendaImagem: string;
  legenda: string;
  colar: Partial<Record<TipoExercicio, string>>;
};

const idioma: Exemplos = {
  frase: "Ex.: Cuando era niño, ___ al parque todos los días.",
  resposta: "iba",
  erro: "fui",
  explicacaoErros: "Ex.: Para hábitos no passado, use o pretérito imperfeito: iba, comía, jugaba.",
  dica: "Ex.: É uma ação que se repetia no passado.",
  pergunta: "Ex.: Vivo ___ Madrid.",
  palavraExtra: "Ex.: fue",
  colunas: ["Ex.: Ser", "Ex.: Estar"],
  cartao: "Ex.: Madrid",
  esquerda: "Ex.: perro",
  direita: "Ex.: cachorro",
  explicacaoPar: "Ex.: 'Perro' é cachorro; 'gato' é o mesmo nas duas línguas.",
  propostaEscrita: "Ex.: Escreva 5 frases sobre o que você fazia nas férias quando era criança.",
  propostaOral: "Ex.: Grave um áudio contando o que você fazia nas férias quando era criança.",
  orientacao: "Ex.: Uso do pretérito imperfeito; pelo menos 5 frases.",
  legendaImagem: "Ex.: Uma feira de rua em Madri",
  legenda: "Ex.: Ouça o diálogo duas vezes.",
  colar: {
    lacuna: "Cuando era niño, [iba] al parque todos los días.\nAyer [fui|estuve] al cine.",
    arrastar: "Vivo [en] São Paulo.\nVoy [a] la escuela.",
    multipla_escolha: "¿Cómo se dice 'cachorro'? ; *perro ; gato ; pájaro",
    relacionar: "perro ; cachorro\ngato ; gato",
    classificar: "comí ; Pretérito\ncomo ; Presente",
    producao: "Conte o que você fez no último fim de semana.",
  },
};

const materia: Exemplos = {
  frase: "Ex.: Com o calor do sol, a água do mar vira vapor por ___.",
  resposta: "evaporação",
  erro: "condensação",
  explicacaoErros: "Ex.: Quando a água vira vapor com o calor, é evaporação. Condensação é o caminho de volta.",
  dica: "Ex.: Pense no que o sol faz com uma poça d'água.",
  pergunta: "Ex.: Qual é a capital do Peru?",
  palavraExtra: "Ex.: fusão",
  colunas: ["Ex.: Mamífero", "Ex.: Peixe"],
  cartao: "Ex.: Baleia",
  esquerda: "Ex.: Brasil",
  direita: "Ex.: Brasília",
  explicacaoPar: "Ex.: A capital do Brasil é Brasília desde 1960, não o Rio de Janeiro.",
  propostaEscrita: "Ex.: Explique com suas palavras como a chuva se forma.",
  propostaOral: "Ex.: Grave um áudio explicando como a chuva se forma.",
  orientacao: "Ex.: Citar evaporação e condensação; pelo menos 5 linhas.",
  legendaImagem: "Ex.: Mapa do Brasil com as cinco regiões",
  legenda: "Ex.: Assista ao vídeo até o fim antes de responder.",
  colar: {
    lacuna: "A água do mar vira vapor por [evaporação].\nA capital da França é [Paris].",
    arrastar: "O coração bombeia o [sangue].\nAs plantas fazem [fotossíntese].",
    multipla_escolha: "Qual é a capital do Peru? ; *Lima ; Cusco ; Quito",
    relacionar: "Brasil ; Brasília\nArgentina ; Buenos Aires",
    classificar: "Baleia ; Mamífero\nTubarão ; Peixe",
    producao: "Explique com suas palavras como a chuva se forma.",
  },
};

const Contexto = createContext<Exemplos>(materia);

export function ExemplosDoEditor({ tipo, children }: { tipo: "idioma" | "materia"; children: React.ReactNode }) {
  return <Contexto.Provider value={tipo === "idioma" ? idioma : materia}>{children}</Contexto.Provider>;
}

export function useExemplos() {
  return useContext(Contexto);
}
