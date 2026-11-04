export type ErroPrevisto = {
  valor: string;
  explicacao: string;
};

export type ItemLacuna = {
  /** Identifica o item para salvar respostas. */
  id?: string;
  tipo: "lacuna";
  enunciado: string;
  aceitas: string[];
  errosPrevistos: ErroPrevisto[];
  explicacaoPadrao: string;
  /** Marcada: acento ou hífen diferente é erro. Desmarcada: certo com aviso. */
  grafiaExata: boolean;
};

export type Alternativa = {
  id: string;
  texto: string;
  correta: boolean;
  explicacao?: string;
};

export type ItemMultiplaEscolha = {
  id?: string;
  tipo: "multipla_escolha";
  enunciado: string;
  alternativas: Alternativa[];
  explicacaoPadrao: string;
};

/** Lacuna preenchida arrastando uma palavra do banco do exercício. */
export type ItemArrastar = {
  id?: string;
  tipo: "arrastar";
  enunciado: string;
  resposta: string;
  errosPrevistos: ErroPrevisto[];
  explicacaoPadrao: string;
};

/** Cartão que o aluno coloca numa das colunas do exercício. */
export type ItemClassificar = {
  id?: string;
  tipo: "classificar";
  texto: string;
  colunaId: string;
  /** Por que o cartão pertence à coluna certa. */
  explicacao: string;
  /** Imagem opcional do cartão (link https). */
  imagem?: string;
};

/** Par que o aluno liga: esquerda com direita. */
export type ItemRelacionar = {
  id?: string;
  tipo: "relacionar";
  esquerda: string;
  direita: string;
  /** Mostrada quando o aluno liga a esquerda ao par errado. */
  explicacao: string;
};

export type Item = ItemLacuna | ItemMultiplaEscolha | ItemArrastar | ItemClassificar | ItemRelacionar;

export type Resultado =
  | { status: "certo"; explicacao?: string }
  | { status: "certo_com_aviso"; aviso: string }
  | { status: "errado"; explicacao: string; aviso?: string };
