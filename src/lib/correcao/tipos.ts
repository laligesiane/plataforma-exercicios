export type ErroPrevisto = {
  valor: string;
  explicacao: string;
};

export type ItemLacuna = {
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
  tipo: "multipla_escolha";
  enunciado: string;
  alternativas: Alternativa[];
  explicacaoPadrao: string;
};

export type Item = ItemLacuna | ItemMultiplaEscolha;

export type Resultado =
  | { status: "certo"; explicacao?: string }
  | { status: "certo_com_aviso"; aviso: string }
  | { status: "errado"; explicacao: string; aviso?: string };
