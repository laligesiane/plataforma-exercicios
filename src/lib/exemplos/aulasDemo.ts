import type { Exercicio } from "@/lib/atividades/modelo";

/** Aula de demonstração: uma matéria com um exercício de cada tipo, para quem quer experimentar sem conta. */
export type AulaDemo = {
  slug: string;
  materia: string;
  /** Uma ou duas letras para o ícone do cartão. */
  sigla: string;
  titulo: string;
  /** Frase curta do cartão na escolha da matéria. */
  chamada: string;
  explicacao: string;
  /** Idioma do conteúdo, para o leitor de tela pronunciar certo. */
  lang?: string;
  exercicios: Exercicio[];
};

const KAHOOT = "https://kahoot.it";
const kahootInstrucoes =
  "Na aula de verdade, o professor cola aqui o link do jogo dele. Na demonstração, o botão abre a página do Kahoot.";
const producaoInstrucoes =
  "Responda com suas palavras. Na aula de verdade o professor lê, corrige e comenta. Aqui nada é enviado.";

export const aulasDemo: AulaDemo[] = [
  {
    slug: "portugues",
    materia: "Português",
    sigla: "Pt",
    titulo: "Verbos, plural e preposições",
    chamada: "Passado dos verbos, plural com -ão e onde as coisas estão.",
    explicacao:
      "Esta aula mostra todos os tipos de exercício da Repasa. Responda e veja na hora se acertou. Se errar, a explicação aparece logo abaixo. Experimente errar de propósito.",
    exercicios: [
      {
        id: "pt-lacuna",
        tipo: "lacuna",
        titulo: "Complete as frases",
        instrucoes: "Escreva a palavra que falta e aperte Enter.",
        itens: [
          {
            id: "pt-lacuna-1",
            tipo: "lacuna",
            enunciado: "Ontem nós ___ ao cinema. (ir)",
            aceitas: ["fomos"],
            errosPrevistos: [
              { valor: "vamos", explicacao: "'Ontem' pede o passado. 'Vamos' é presente; o passado de 'nós vamos' é 'nós fomos'." },
              { valor: "foi", explicacao: "'Foi' combina com ele ou ela. Com 'nós', o verbo fica 'fomos'." },
            ],
            explicacaoPadrao: "O verbo 'ir' no passado, com 'nós', é 'fomos'.",
            grafiaExata: false,
          },
          {
            id: "pt-lacuna-2",
            tipo: "lacuna",
            enunciado: "Na padaria, comprei dois ___. (pão)",
            aceitas: ["pães"],
            errosPrevistos: [{ valor: "pãos", explicacao: "Palavras com -ão têm plurais diferentes. O de 'pão' é 'pães', como 'cão, cães'." }],
            explicacaoPadrao: "O plural de 'pão' é 'pães'.",
            grafiaExata: false,
          },
          {
            id: "pt-lacuna-3",
            tipo: "lacuna",
            enunciado: "O pai da minha mãe é o meu ___.",
            aceitas: ["avô"],
            errosPrevistos: [{ valor: "avó", explicacao: "Avó (acento agudo) é a mãe da mãe. O pai é avô, com acento circunflexo." }],
            explicacaoPadrao: "O pai da mãe é o avô.",
            grafiaExata: true,
          },
        ],
      },
      {
        id: "pt-multipla",
        tipo: "multipla_escolha",
        titulo: "Olhe a imagem e escolha",
        instrucoes: "Clique na alternativa correta.",
        midia: { tipo: "imagem", url: "/demo/gato-caixa.svg", legenda: "Onde está o gato?" },
        itens: [
          {
            id: "pt-multipla-1",
            tipo: "multipla_escolha",
            enunciado: "O gato está ___ da caixa.",
            alternativas: [
              { id: "a", texto: "dentro", correta: false, explicacao: "Dentro seria escondido na caixa. Na imagem, ele aparece inteiro." },
              { id: "b", texto: "em cima", correta: true, explicacao: "Isso! Ele está sentado sobre a caixa." },
              { id: "c", texto: "embaixo", correta: false, explicacao: "Embaixo seria sob a caixa. Olhe de novo: ele está no alto." },
            ],
            explicacaoPadrao: "O gato está em cima da caixa.",
          },
          {
            id: "pt-multipla-2",
            tipo: "multipla_escolha",
            enunciado: "Qual frase está escrita corretamente?",
            alternativas: [
              { id: "a", texto: "Fazem dois anos que moro aqui.", correta: false, explicacao: "'Fazer' indicando tempo não vai para o plural: faz dois anos." },
              { id: "b", texto: "Faz dois anos que moro aqui.", correta: true },
              { id: "c", texto: "Fazem dois ano que moro aqui.", correta: false, explicacao: "Aqui há dois erros: 'fazem' e 'ano' no singular." },
            ],
            explicacaoPadrao: "Com sentido de tempo passado, 'fazer' fica sempre no singular: faz dois anos.",
          },
        ],
      },
      {
        id: "pt-arrastar",
        tipo: "arrastar",
        titulo: "Complete com as palavras",
        instrucoes: "Arraste cada palavra para a lacuna certa, ou toque na palavra e depois na lacuna.",
        palavrasExtras: ["mau"],
        itens: [
          {
            id: "pt-arrastar-1",
            tipo: "arrastar",
            enunciado: "Não fui à festa ___ estava cansada.",
            resposta: "porque",
            errosPrevistos: [{ valor: "mas", explicacao: "'Mas' mostra oposição. Aqui a frase explica o motivo, então pede 'porque'." }],
            explicacaoPadrao: "Para explicar o motivo, use 'porque'.",
          },
          {
            id: "pt-arrastar-2",
            tipo: "arrastar",
            enunciado: "Queria ir, ___ choveu o dia todo.",
            resposta: "mas",
            errosPrevistos: [{ valor: "porque", explicacao: "A chuva atrapalhou o plano: é uma oposição, então pede 'mas'." }],
            explicacaoPadrao: "Para mostrar oposição, use 'mas'.",
          },
          {
            id: "pt-arrastar-3",
            tipo: "arrastar",
            enunciado: "Hoje o tempo está ___ para ir à praia.",
            resposta: "mal",
            errosPrevistos: [{ valor: "mau", explicacao: "Truque: 'mau' é o contrário de 'bom'; 'mal' é o contrário de 'bem'. Aqui seria 'está bem', então é 'mal'." }],
            explicacaoPadrao: "'Mal' é o contrário de 'bem'.",
          },
        ],
      },
      {
        id: "pt-classificar",
        tipo: "classificar",
        titulo: "Classifique as palavras",
        instrucoes: "Arraste cada cartão para a coluna certa, ou toque no cartão e depois na coluna.",
        colunas: [
          { id: "subst", nome: "Substantivo" },
          { id: "verbo", nome: "Verbo" },
          { id: "adj", nome: "Adjetivo" },
        ],
        itens: [
          { id: "pt-cl-1", tipo: "classificar", texto: "casa", colunaId: "subst", explicacao: "'Casa' dá nome a uma coisa: é substantivo." },
          { id: "pt-cl-2", tipo: "classificar", texto: "correr", colunaId: "verbo", explicacao: "'Correr' é uma ação: é verbo." },
          { id: "pt-cl-3", tipo: "classificar", texto: "bonito", colunaId: "adj", explicacao: "'Bonito' diz como algo é: é adjetivo." },
          { id: "pt-cl-4", tipo: "classificar", texto: "alegria", colunaId: "subst", explicacao: "'Alegria' dá nome a um sentimento: é substantivo." },
          { id: "pt-cl-5", tipo: "classificar", texto: "estudar", colunaId: "verbo", explicacao: "'Estudar' é uma ação: é verbo." },
          { id: "pt-cl-6", tipo: "classificar", texto: "rápido", colunaId: "adj", explicacao: "'Rápido' diz como algo é: é adjetivo." },
        ],
      },
      {
        id: "pt-relacionar",
        tipo: "relacionar",
        titulo: "Relacione os sinônimos",
        instrucoes: "Toque num item da esquerda e depois no par dele à direita.",
        itens: [
          { id: "pt-rel-1", tipo: "relacionar", esquerda: "feliz", direita: "contente", explicacao: "Feliz e contente querem dizer a mesma coisa." },
          { id: "pt-rel-2", tipo: "relacionar", esquerda: "começar", direita: "iniciar", explicacao: "Começar e iniciar são sinônimos." },
          { id: "pt-rel-3", tipo: "relacionar", esquerda: "rápido", direita: "veloz", explicacao: "Rápido e veloz são sinônimos." },
          { id: "pt-rel-4", tipo: "relacionar", esquerda: "bonito", direita: "belo", explicacao: "Bonito e belo são sinônimos." },
        ],
      },
      {
        id: "pt-producao",
        tipo: "producao",
        titulo: "Escreva e fale",
        instrucoes: producaoInstrucoes,
        itens: [
          {
            id: "pt-prod-1",
            tipo: "producao",
            enunciado: "Conte em 3 ou 4 frases o que você fez no último fim de semana. Use verbos no passado.",
            modo: "escrita",
            orientacao: "Verbos no pretérito perfeito.",
          },
          {
            id: "pt-prod-2",
            tipo: "producao",
            enunciado: "Grave um áudio lendo em voz alta: “O rato roeu a roupa do rei de Roma.”",
            modo: "oral",
            orientacao: "Pronúncia do R.",
          },
        ],
      },
      { id: "pt-kahoot", tipo: "kahoot", titulo: "Jogue um Kahoot", instrucoes: kahootInstrucoes, link: KAHOOT, itens: [] },
    ],
  },
  {
    slug: "espanhol",
    materia: "Espanhol",
    sigla: "Es",
    titulo: "Hábitos no passado, horas e preposições",
    chamada: "Pretérito imperfeito, que horas são e falsos amigos.",
    lang: "es",
    explicacao:
      "Esta aula mostra todos os tipos de exercício da Repasa. As explicações ficam em português e o conteúdo em espanhol. Experimente errar de propósito.",
    exercicios: [
      {
        id: "es-lacuna",
        tipo: "lacuna",
        titulo: "Complete as frases",
        instrucoes: "Escreva a palavra que falta e aperte Enter.",
        itens: [
          {
            id: "es-lacuna-1",
            tipo: "lacuna",
            enunciado: "Cuando era niño, ___ al parque todos los días. (ir)",
            aceitas: ["iba"],
            errosPrevistos: [
              { valor: "fui", explicacao: "É uma ação habitual no passado, então pede pretérito imperfeito (iba), não indefinido (fui)." },
              { valor: "voy", explicacao: "'Cuando era niño' situa a frase no passado; o presente não serve aqui." },
            ],
            explicacaoPadrao: "Para hábitos no passado, use o pretérito imperfeito: iba, comía, jugaba.",
            grafiaExata: false,
          },
          {
            id: "es-lacuna-2",
            tipo: "lacuna",
            enunciado: "Mi abuela siempre ___ sopa los domingos. (cocinar)",
            aceitas: ["cocinaba"],
            errosPrevistos: [{ valor: "cocinó", explicacao: "'Siempre' indica hábito: use o imperfeito, cocinaba." }],
            explicacaoPadrao: "Hábito no passado: cocinar → cocinaba.",
            grafiaExata: false,
          },
          {
            id: "es-lacuna-3",
            tipo: "lacuna",
            enunciado: "Después de la lluvia salió el ___.",
            aceitas: ["arcoíris"],
            errosPrevistos: [{ valor: "arco", explicacao: "Falta a segunda parte da palavra: arcoíris." }],
            explicacaoPadrao: "A palavra é arcoíris.",
            grafiaExata: false,
          },
        ],
      },
      {
        id: "es-multipla",
        tipo: "multipla_escolha",
        titulo: "Olhe o relógio e escolha",
        instrucoes: "Clique na alternativa correta.",
        midia: { tipo: "imagem", url: "/demo/relogio.svg" },
        itens: [
          {
            id: "es-multipla-1",
            tipo: "multipla_escolha",
            enunciado: "¿Qué hora es?",
            alternativas: [
              { id: "a", texto: "Son las tres y media.", correta: true, explicacao: "Isso! 'Y media' é a meia hora." },
              { id: "b", texto: "Es la tres y media.", correta: false, explicacao: "'Es la' só se usa com uma hora (es la una). Para as outras, 'son las'." },
              { id: "c", texto: "Son las seis y quince.", correta: false, explicacao: "O ponteiro pequeno está entre o 3 e o 4, e o grande no 6: três e meia." },
            ],
            explicacaoPadrao: "São três e meia: son las tres y media.",
          },
          {
            id: "es-multipla-2",
            tipo: "multipla_escolha",
            enunciado: "Vivo ___ Madrid.",
            alternativas: [
              { id: "a", texto: "a", correta: false, explicacao: "'A' indica direção (voy a Madrid). Para onde se vive, use 'en'." },
              { id: "b", texto: "en", correta: true, explicacao: "'En' indica o lugar onde se está." },
              { id: "c", texto: "de", correta: false, explicacao: "'De' indica origem (soy de Madrid), não onde se vive." },
            ],
            explicacaoPadrao: "Para o lugar onde se está ou se vive, use 'en'.",
          },
        ],
      },
      {
        id: "es-arrastar",
        tipo: "arrastar",
        titulo: "Complete com as palavras",
        instrucoes: "Arraste cada palavra para a lacuna certa, ou toque na palavra e depois na lacuna.",
        palavrasExtras: ["muy"],
        itens: [
          {
            id: "es-arrastar-1",
            tipo: "arrastar",
            enunciado: "Hay ___ gente en la playa.",
            resposta: "mucha",
            errosPrevistos: [{ valor: "muy", explicacao: "'Muy' vai antes de adjetivo ou advérbio (muy bonito). Antes de substantivo, use 'mucho/mucha'." }],
            explicacaoPadrao: "Antes de substantivo, use 'mucho/mucha': mucha gente.",
          },
          {
            id: "es-arrastar-2",
            tipo: "arrastar",
            enunciado: "Me ___ el chocolate.",
            resposta: "gusta",
            errosPrevistos: [{ valor: "gustan", explicacao: "'El chocolate' é singular, então o verbo fica 'gusta'." }],
            explicacaoPadrao: "Com uma coisa só, 'me gusta'.",
          },
          {
            id: "es-arrastar-3",
            tipo: "arrastar",
            enunciado: "Me ___ los gatos.",
            resposta: "gustan",
            errosPrevistos: [{ valor: "gusta", explicacao: "'Los gatos' é plural, então o verbo fica 'gustan'." }],
            explicacaoPadrao: "Com várias coisas, 'me gustan'.",
          },
        ],
      },
      {
        id: "es-classificar",
        tipo: "classificar",
        titulo: "Falsos amigos",
        instrucoes: "A palavra em espanhol quer dizer o mesmo que em português? Arraste para a coluna certa.",
        colunas: [
          { id: "igual", nome: "Mesmo sentido" },
          { id: "falso", nome: "Falso amigo" },
        ],
        itens: [
          { id: "es-cl-1", tipo: "classificar", texto: "exquisito", colunaId: "falso", explicacao: "'Exquisito' quer dizer delicioso, não esquisito." },
          { id: "es-cl-2", tipo: "classificar", texto: "embarazada", colunaId: "falso", explicacao: "'Embarazada' quer dizer grávida, não embaraçada." },
          { id: "es-cl-3", tipo: "classificar", texto: "rato", colunaId: "falso", explicacao: "'Rato' quer dizer um momento. Rato, em espanhol, é 'ratón'." },
          { id: "es-cl-4", tipo: "classificar", texto: "casa", colunaId: "igual", explicacao: "'Casa' quer dizer casa nas duas línguas." },
          { id: "es-cl-5", tipo: "classificar", texto: "libro", colunaId: "igual", explicacao: "'Libro' é livro, como parece." },
        ],
      },
      {
        id: "es-relacionar",
        tipo: "relacionar",
        titulo: "Relacione as palavras",
        instrucoes: "Toque num item da esquerda e depois na tradução dele à direita.",
        itens: [
          { id: "es-rel-1", tipo: "relacionar", esquerda: "ventana", direita: "janela", explicacao: "'Ventana' é janela." },
          { id: "es-rel-2", tipo: "relacionar", esquerda: "cuchara", direita: "colher", explicacao: "'Cuchara' é colher." },
          { id: "es-rel-3", tipo: "relacionar", esquerda: "zapato", direita: "sapato", explicacao: "'Zapato' é sapato." },
          { id: "es-rel-4", tipo: "relacionar", esquerda: "almohada", direita: "travesseiro", explicacao: "'Almohada' é travesseiro." },
        ],
      },
      {
        id: "es-producao",
        tipo: "producao",
        titulo: "Escreva e fale",
        instrucoes: producaoInstrucoes,
        itens: [
          {
            id: "es-prod-1",
            tipo: "producao",
            enunciado: "Escribe 3 frases sobre lo que hacías cuando eras niño o niña.",
            modo: "escrita",
            orientacao: "Pretérito imperfeito.",
          },
          {
            id: "es-prod-2",
            tipo: "producao",
            enunciado: "Graba un audio presentándote: nombre, ciudad y qué te gusta hacer.",
            modo: "oral",
            orientacao: "Apresentação pessoal.",
          },
        ],
      },
      { id: "es-kahoot", tipo: "kahoot", titulo: "Jogue um Kahoot", instrucoes: kahootInstrucoes, link: KAHOOT, itens: [] },
    ],
  },
  {
    slug: "ingles",
    materia: "Inglês",
    sigla: "En",
    titulo: "Past simple, weather and prepositions",
    chamada: "Passado dos verbos, o tempo lá fora e in, on, at.",
    lang: "en",
    explicacao:
      "Esta aula mostra todos os tipos de exercício da Repasa. As explicações ficam em português e o conteúdo em inglês. Experimente errar de propósito.",
    exercicios: [
      {
        id: "en-lacuna",
        tipo: "lacuna",
        titulo: "Complete as frases",
        instrucoes: "Escreva a palavra que falta e aperte Enter.",
        itens: [
          {
            id: "en-lacuna-1",
            tipo: "lacuna",
            enunciado: "Yesterday I ___ to the beach. (go)",
            aceitas: ["went"],
            errosPrevistos: [
              { valor: "goed", explicacao: "'Go' é irregular: o passado é 'went', não 'goed'." },
              { valor: "go", explicacao: "'Yesterday' pede o passado: went." },
            ],
            explicacaoPadrao: "O passado de 'go' é 'went'.",
            grafiaExata: false,
          },
          {
            id: "en-lacuna-2",
            tipo: "lacuna",
            enunciado: "She ___ a pizza last night. (eat)",
            aceitas: ["ate"],
            errosPrevistos: [{ valor: "eated", explicacao: "'Eat' é irregular: o passado é 'ate'." }],
            explicacaoPadrao: "O passado de 'eat' é 'ate'.",
            grafiaExata: false,
          },
          {
            id: "en-lacuna-3",
            tipo: "lacuna",
            enunciado: "We ___ football after school. (play)",
            aceitas: ["played"],
            errosPrevistos: [{ valor: "plaied", explicacao: "Quando antes do 'y' vem vogal, só se acrescenta -ed: played." }],
            explicacaoPadrao: "'Play' é regular: played.",
            grafiaExata: true,
          },
        ],
      },
      {
        id: "en-multipla",
        tipo: "multipla_escolha",
        titulo: "Olhe a imagem e escolha",
        instrucoes: "Clique na alternativa correta.",
        midia: { tipo: "imagem", url: "/demo/chuva.svg" },
        itens: [
          {
            id: "en-multipla-1",
            tipo: "multipla_escolha",
            enunciado: "What's the weather like?",
            alternativas: [
              { id: "a", texto: "It's sunny.", correta: false, explicacao: "Sunny é ensolarado. Na imagem não tem sol." },
              { id: "b", texto: "It's rainy.", correta: true, explicacao: "Isso! Rainy é chuvoso." },
              { id: "c", texto: "It's snowy.", correta: false, explicacao: "Snowy é com neve. Na imagem caem gotas de chuva." },
            ],
            explicacaoPadrao: "Está chovendo: it's rainy.",
          },
          {
            id: "en-multipla-2",
            tipo: "multipla_escolha",
            enunciado: "My birthday is ___ May.",
            alternativas: [
              { id: "a", texto: "in", correta: true, explicacao: "Com meses, use 'in': in May." },
              { id: "b", texto: "on", correta: false, explicacao: "'On' é para dias e datas: on Monday, on May 5th." },
              { id: "c", texto: "at", correta: false, explicacao: "'At' é para horas: at 7 o'clock." },
            ],
            explicacaoPadrao: "Meses usam 'in'.",
          },
        ],
      },
      {
        id: "en-arrastar",
        tipo: "arrastar",
        titulo: "Complete com as palavras",
        instrucoes: "Arraste cada palavra para a lacuna certa, ou toque na palavra e depois na lacuna.",
        palavrasExtras: ["are"],
        itens: [
          {
            id: "en-arrastar-1",
            tipo: "arrastar",
            enunciado: "I ___ a student.",
            resposta: "am",
            errosPrevistos: [{ valor: "is", explicacao: "Com 'I', o verbo to be fica 'am'." }],
            explicacaoPadrao: "I am.",
          },
          {
            id: "en-arrastar-2",
            tipo: "arrastar",
            enunciado: "He ___ my brother.",
            resposta: "is",
            errosPrevistos: [{ valor: "are", explicacao: "Com 'he', 'she' e 'it', use 'is'." }],
            explicacaoPadrao: "He is.",
          },
          {
            id: "en-arrastar-3",
            tipo: "arrastar",
            enunciado: "She ___ to school every day.",
            resposta: "goes",
            errosPrevistos: [{ valor: "is", explicacao: "Aqui falta um verbo de ação: ela vai (goes) à escola." }],
            explicacaoPadrao: "Com 'she', o presente de 'go' ganha -es: goes.",
          },
        ],
      },
      {
        id: "en-classificar",
        tipo: "classificar",
        titulo: "Regular ou irregular?",
        instrucoes: "Arraste cada verbo para a coluna certa, ou toque no verbo e depois na coluna.",
        colunas: [
          { id: "reg", nome: "Regular (-ed)" },
          { id: "irr", nome: "Irregular" },
        ],
        itens: [
          { id: "en-cl-1", tipo: "classificar", texto: "work", colunaId: "reg", explicacao: "Work → worked: regular." },
          { id: "en-cl-2", tipo: "classificar", texto: "see", colunaId: "irr", explicacao: "See → saw: irregular." },
          { id: "en-cl-3", tipo: "classificar", texto: "watch", colunaId: "reg", explicacao: "Watch → watched: regular." },
          { id: "en-cl-4", tipo: "classificar", texto: "buy", colunaId: "irr", explicacao: "Buy → bought: irregular." },
          { id: "en-cl-5", tipo: "classificar", texto: "write", colunaId: "irr", explicacao: "Write → wrote: irregular." },
        ],
      },
      {
        id: "en-relacionar",
        tipo: "relacionar",
        titulo: "Relacione os opostos",
        instrucoes: "Toque num item da esquerda e depois no oposto dele à direita.",
        itens: [
          { id: "en-rel-1", tipo: "relacionar", esquerda: "hot", direita: "cold", explicacao: "Hot (quente) é o oposto de cold (frio)." },
          { id: "en-rel-2", tipo: "relacionar", esquerda: "big", direita: "small", explicacao: "Big (grande) é o oposto de small (pequeno)." },
          { id: "en-rel-3", tipo: "relacionar", esquerda: "early", direita: "late", explicacao: "Early (cedo) é o oposto de late (tarde)." },
          { id: "en-rel-4", tipo: "relacionar", esquerda: "happy", direita: "sad", explicacao: "Happy (feliz) é o oposto de sad (triste)." },
        ],
      },
      {
        id: "en-producao",
        tipo: "producao",
        titulo: "Escreva e fale",
        instrucoes: producaoInstrucoes,
        itens: [
          {
            id: "en-prod-1",
            tipo: "producao",
            enunciado: "Write 3 sentences about your last holiday.",
            modo: "escrita",
            orientacao: "Past simple.",
          },
          {
            id: "en-prod-2",
            tipo: "producao",
            enunciado: "Record yourself saying: “I usually wake up at seven and have breakfast with my family.”",
            modo: "oral",
            orientacao: "Pronúncia e ritmo.",
          },
        ],
      },
      { id: "en-kahoot", tipo: "kahoot", titulo: "Jogue um Kahoot", instrucoes: kahootInstrucoes, link: KAHOOT, itens: [] },
    ],
  },
  {
    slug: "matematica",
    materia: "Matemática",
    sigla: "Mt",
    titulo: "Frações, contas e formas",
    chamada: "Frações com pizza, contas rápidas e figuras geométricas.",
    explicacao:
      "A Repasa não é só para idiomas: dá para montar aula de qualquer matéria. Esta mostra todos os tipos de exercício com Matemática. Experimente errar de propósito.",
    exercicios: [
      {
        id: "mt-lacuna",
        tipo: "lacuna",
        titulo: "Faça as contas",
        instrucoes: "Escreva o resultado e aperte Enter.",
        itens: [
          {
            id: "mt-lacuna-1",
            tipo: "lacuna",
            enunciado: "7 × 8 = ___",
            aceitas: ["56"],
            errosPrevistos: [{ valor: "54", explicacao: "Quase! 54 é 6 × 9. Pense em 7 × 8 como 7 × 4 = 28, e o dobro: 56." }],
            explicacaoPadrao: "7 × 8 = 56.",
            grafiaExata: false,
          },
          {
            id: "mt-lacuna-2",
            tipo: "lacuna",
            enunciado: "Metade de 50 é ___.",
            aceitas: ["25"],
            errosPrevistos: [{ valor: "100", explicacao: "100 é o dobro de 50. Metade é dividir por 2: 25." }],
            explicacaoPadrao: "Metade é dividir por 2: 50 ÷ 2 = 25.",
            grafiaExata: false,
          },
          {
            id: "mt-lacuna-3",
            tipo: "lacuna",
            enunciado: "Um triângulo tem ___ lados.",
            aceitas: ["3", "três"],
            errosPrevistos: [{ valor: "4", explicacao: "Quatro lados é o quadrado. 'Tri' quer dizer três." }],
            explicacaoPadrao: "Triângulo tem 3 lados.",
            grafiaExata: false,
          },
        ],
      },
      {
        id: "mt-multipla",
        tipo: "multipla_escolha",
        titulo: "Olhe a pizza e escolha",
        instrucoes: "Clique na alternativa correta.",
        midia: { tipo: "imagem", url: "/demo/pizza.svg", legenda: "Que parte da pizza está pintada?" },
        itens: [
          {
            id: "mt-multipla-1",
            tipo: "multipla_escolha",
            enunciado: "Que fração da pizza está pintada de vermelho?",
            alternativas: [
              { id: "a", texto: "3/8", correta: true, explicacao: "Isso! A pizza tem 8 fatias e 3 estão pintadas." },
              { id: "b", texto: "3/5", correta: false, explicacao: "O número de baixo é o total de fatias. Conte de novo: são 8." },
              { id: "c", texto: "5/8", correta: false, explicacao: "5/8 é a parte sem pintar. A pintada são 3 fatias." },
            ],
            explicacaoPadrao: "3 fatias pintadas de 8: 3/8.",
          },
          {
            id: "mt-multipla-2",
            tipo: "multipla_escolha",
            enunciado: "Quanto é 2 + 3 × 4?",
            alternativas: [
              { id: "a", texto: "20", correta: false, explicacao: "A multiplicação vem antes da soma: 3 × 4 = 12, depois 2 + 12." },
              { id: "b", texto: "14", correta: true, explicacao: "Isso! Primeiro 3 × 4 = 12, depois 2 + 12 = 14." },
              { id: "c", texto: "9", correta: false, explicacao: "9 seria somar tudo. A multiplicação vem antes: 2 + 12 = 14." },
            ],
            explicacaoPadrao: "Multiplicação antes da soma: 2 + 12 = 14.",
          },
        ],
      },
      {
        id: "mt-arrastar",
        tipo: "arrastar",
        titulo: "Complete com os números",
        instrucoes: "Arraste cada número para a lacuna certa, ou toque no número e depois na lacuna.",
        palavrasExtras: ["10"],
        itens: [
          {
            id: "mt-arrastar-1",
            tipo: "arrastar",
            enunciado: "Uma dúzia tem ___ unidades.",
            resposta: "12",
            errosPrevistos: [{ valor: "10", explicacao: "10 é uma dezena. A dúzia tem 12, como uma caixa de ovos." }],
            explicacaoPadrao: "Uma dúzia são 12.",
          },
          {
            id: "mt-arrastar-2",
            tipo: "arrastar",
            enunciado: "Uma hora tem ___ minutos.",
            resposta: "60",
            errosPrevistos: [{ valor: "100", explicacao: "O relógio não conta de 100 em 100: uma hora tem 60 minutos." }],
            explicacaoPadrao: "Uma hora tem 60 minutos.",
          },
          {
            id: "mt-arrastar-3",
            tipo: "arrastar",
            enunciado: "Um metro tem ___ centímetros.",
            resposta: "100",
            errosPrevistos: [{ valor: "60", explicacao: "60 é dos minutos. 'Centi' quer dizer cem: 100 centímetros." }],
            explicacaoPadrao: "Um metro tem 100 centímetros.",
          },
        ],
      },
      {
        id: "mt-classificar",
        tipo: "classificar",
        titulo: "Par ou ímpar?",
        instrucoes: "Arraste cada número para a coluna certa, ou toque no número e depois na coluna.",
        colunas: [
          { id: "par", nome: "Par" },
          { id: "impar", nome: "Ímpar" },
        ],
        itens: [
          { id: "mt-cl-1", tipo: "classificar", texto: "14", colunaId: "par", explicacao: "14 termina em 4, que é par." },
          { id: "mt-cl-2", tipo: "classificar", texto: "27", colunaId: "impar", explicacao: "27 termina em 7, que é ímpar." },
          { id: "mt-cl-3", tipo: "classificar", texto: "100", colunaId: "par", explicacao: "100 termina em 0, que é par." },
          { id: "mt-cl-4", tipo: "classificar", texto: "33", colunaId: "impar", explicacao: "33 termina em 3, que é ímpar." },
          { id: "mt-cl-5", tipo: "classificar", texto: "8", colunaId: "par", explicacao: "8 dá para dividir por 2 sem sobrar: é par." },
        ],
      },
      {
        id: "mt-relacionar",
        tipo: "relacionar",
        titulo: "Relacione a figura ao número de lados",
        instrucoes: "Toque num item da esquerda e depois no par dele à direita.",
        itens: [
          { id: "mt-rel-1", tipo: "relacionar", esquerda: "Triângulo", direita: "3 lados", explicacao: "Triângulo tem 3 lados." },
          { id: "mt-rel-2", tipo: "relacionar", esquerda: "Quadrado", direita: "4 lados", explicacao: "Quadrado tem 4 lados iguais." },
          { id: "mt-rel-3", tipo: "relacionar", esquerda: "Pentágono", direita: "5 lados", explicacao: "'Penta' quer dizer cinco." },
          { id: "mt-rel-4", tipo: "relacionar", esquerda: "Hexágono", direita: "6 lados", explicacao: "'Hexa' quer dizer seis." },
        ],
      },
      {
        id: "mt-producao",
        tipo: "producao",
        titulo: "Explique com suas palavras",
        instrucoes: producaoInstrucoes,
        itens: [
          {
            id: "mt-prod-1",
            tipo: "producao",
            enunciado: "Ana tinha 20 reais e gastou 3/4 numa lanchonete. Quanto sobrou? Explique como você pensou.",
            modo: "escrita",
            orientacao: "Resposta: 5 reais.",
          },
          {
            id: "mt-prod-2",
            tipo: "producao",
            enunciado: "Grave um áudio explicando por que qualquer número que termina em 0 é par.",
            modo: "oral",
            orientacao: "Divisível por 2 (e por 10).",
          },
        ],
      },
      { id: "mt-kahoot", tipo: "kahoot", titulo: "Jogue um Kahoot", instrucoes: kahootInstrucoes, link: KAHOOT, itens: [] },
    ],
  },
];

export function aulaDemo(slug: string): AulaDemo | undefined {
  return aulasDemo.find((a) => a.slug === slug);
}
