import { LACUNA, novoId, type Coluna, type TipoExercicio } from "./modelo";

/** Como escrever cada linha ao colar vários itens de uma vez, por tipo de exercício. */
export const ajudaColar: Partial<Record<TipoExercicio, { explicacao: string; exemplo: string }>> = {
  lacuna: {
    explicacao: "Uma frase por linha, com a resposta entre colchetes. Para aceitar mais de uma resposta, separe com |.",
    exemplo: "Cuando era niño, [iba] al parque todos los días.\nAyer [fui|estuve] al cine.",
  },
  arrastar: {
    explicacao: "Uma frase por linha, com a palavra que o aluno arrasta entre colchetes.",
    exemplo: "Vivo [en] São Paulo.\nVoy [a] la escuela.",
  },
  multipla_escolha: {
    explicacao: "Pergunta e alternativas separadas por ponto e vírgula. Marque a certa com *; sem marca, a primeira é a certa.",
    exemplo: "Qual é a capital do Peru? ; *Lima ; Cusco ; Quito",
  },
  relacionar: {
    explicacao: "Um par por linha, separado por ponto e vírgula.",
    exemplo: "perro ; cachorro\ngato ; gato",
  },
  classificar: {
    explicacao: "Cartão e coluna separados por ponto e vírgula. Colunas que não existem são criadas.",
    exemplo: "comí ; Pretérito\ncomo ; Presente",
  },
  producao: {
    explicacao: "Uma proposta por linha.",
    exemplo: "Conte o que você fez no último fim de semana.",
  },
};

type ItemColado = Record<string, unknown> & { id: string; tipo: string };
export type Colados = { itens: ItemColado[]; colunasNovas: Coluna[]; ignoradas: number };

const partes = (linha: string) =>
  linha
    .split(/;|\t/)
    .map((p) => p.trim())
    .filter(Boolean);

/** Troca o primeiro trecho [entre colchetes] pela lacuna e devolve as respostas dele. */
function lacunaDaLinha(linha: string) {
  const achado = linha.match(/\[([^\]]+)\]/);
  if (!achado) return null;
  const respostas = achado[1]
    .split("|")
    .map((r) => r.trim())
    .filter(Boolean);
  if (respostas.length === 0) return null;
  const enunciado = linha.replace(achado[0], LACUNA).trim();
  return { enunciado, respostas };
}

/** Lê o texto colado e monta itens do tipo do exercício. Linhas que não seguem o formato são ignoradas. */
export function itensColados(tipo: TipoExercicio, texto: string, colunas: Coluna[] = []): Colados {
  const linhas = texto
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const itens: ItemColado[] = [];
  const colunasNovas: Coluna[] = [];
  let ignoradas = 0;

  for (const linha of linhas) {
    const item = montar(linha);
    if (item) itens.push(item);
    else ignoradas++;
  }
  return { itens, colunasNovas, ignoradas };

  function montar(linha: string): ItemColado | null {
    switch (tipo) {
      case "lacuna": {
        const l = lacunaDaLinha(linha);
        if (!l) return null;
        return { id: novoId(), tipo, enunciado: l.enunciado, aceitas: l.respostas, errosPrevistos: [], explicacaoPadrao: "", grafiaExata: false };
      }
      case "arrastar": {
        const l = lacunaDaLinha(linha);
        if (!l) return null;
        return { id: novoId(), tipo, enunciado: l.enunciado, resposta: l.respostas[0], errosPrevistos: [], explicacaoPadrao: "" };
      }
      case "multipla_escolha": {
        const [enunciado, ...opcoes] = partes(linha);
        if (!enunciado || opcoes.length < 2) return null;
        const marcada = opcoes.findIndex((o) => o.startsWith("*"));
        const certa = marcada === -1 ? 0 : marcada;
        return {
          id: novoId(),
          tipo,
          enunciado,
          alternativas: opcoes.map((o, i) => ({ id: novoId(), texto: o.replace(/^\*\s*/, ""), correta: i === certa })),
          explicacaoPadrao: "",
        };
      }
      case "relacionar": {
        const [esquerda, direita] = partes(linha);
        if (!esquerda || !direita) return null;
        return { id: novoId(), tipo, esquerda, direita, explicacao: "" };
      }
      case "classificar": {
        const [textoCartao, nomeColuna] = partes(linha);
        if (!textoCartao || !nomeColuna) return null;
        const todas = [...colunas, ...colunasNovas];
        let coluna = todas.find((c) => c.nome.trim().toLowerCase() === nomeColuna.toLowerCase());
        if (!coluna) {
          coluna = { id: novoId(), nome: nomeColuna };
          colunasNovas.push(coluna);
        }
        return { id: novoId(), tipo, texto: textoCartao, colunaId: coluna.id, explicacao: "" };
      }
      case "producao":
        return { id: novoId(), tipo, enunciado: linha, modo: "escrita", orientacao: "" };
      default:
        return null;
    }
  }
}
