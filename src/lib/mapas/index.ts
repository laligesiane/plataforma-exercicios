// Mapa mental: modelo, validação e layout (funções puras, sem React).
// O professor só escreve o texto dos ramos; a posição de cada caixa é calculada aqui.

export const cores = {
  menta: { traco: "#0f9d6b", fundo: "#e3f6ee", nome: "Menta" },
  azul: { traco: "#2f6fd6", fundo: "#e6efff", nome: "Azul" },
  roxo: { traco: "#7a4fd1", fundo: "#efe9ff", nome: "Roxo" },
  coral: { traco: "#d9573b", fundo: "#fdebe6", nome: "Coral" },
  ambar: { traco: "#b7791f", fundo: "#fdf3dc", nome: "Âmbar" },
  rosa: { traco: "#c2417e", fundo: "#fce8f2", nome: "Rosa" },
} as const;
export type Cor = keyof typeof cores;
export const ordemCores = Object.keys(cores) as Cor[];

export type No = { id: string; texto: string; filhos: No[] };
export type Ramo = No & { cor: Cor };
export type Mapa = { centro: string; ramos: Ramo[] };

export const LIMITES = { texto: 80, ramos: 8, filhos: 8, profundidade: 3 } as const;

export function novoId() {
  return Math.random().toString(36).slice(2, 10);
}

export function mapaVazio(centro = ""): Mapa {
  return { centro, ramos: [] };
}

/** Confere e limpa um mapa vindo do formulário ou do banco. Devolve null se não for um mapa. */
export function validarMapa(valor: unknown): Mapa | null {
  if (!valor || typeof valor !== "object") return null;
  const v = valor as Record<string, unknown>;
  if (typeof v.centro !== "string" || !Array.isArray(v.ramos)) return null;

  const limparNo = (n: unknown, nivel: number): No | null => {
    if (!n || typeof n !== "object") return null;
    const o = n as Record<string, unknown>;
    const texto = typeof o.texto === "string" ? o.texto.trim().slice(0, LIMITES.texto) : "";
    if (!texto) return null;
    const filhos =
      nivel < LIMITES.profundidade && Array.isArray(o.filhos)
        ? o.filhos.slice(0, LIMITES.filhos).flatMap((f) => limparNo(f, nivel + 1) ?? [])
        : [];
    return { id: typeof o.id === "string" && o.id ? o.id.slice(0, 32) : novoId(), texto, filhos };
  };

  const ramos = v.ramos.slice(0, LIMITES.ramos).flatMap((r, i) => {
    const no = limparNo(r, 1);
    if (!no) return [];
    const cor = (r as Record<string, unknown>).cor;
    return [{ ...no, cor: ordemCores.includes(cor as Cor) ? (cor as Cor) : ordemCores[i % ordemCores.length] }];
  });
  return { centro: v.centro.trim().slice(0, LIMITES.texto), ramos };
}

// ---------- Layout ----------

const LARGURA_LETRA = { 0: 8.6, 1: 7.6, 2: 7.0, 3: 7.0 } as const;
const LETRAS_POR_LINHA = 24;
const ALTURA_LINHA = 18;
const ESPACO_H = 44; // entre um nível e o próximo
const ESPACO_V = 12; // entre irmãos

export type Caixa = {
  id: string;
  x: number; // canto esquerdo
  y: number; // topo
  w: number;
  h: number;
  linhas: string[];
  nivel: number; // 0 = centro
  cor: Cor | null;
  lado: "direita" | "esquerda" | "centro";
};
export type Ligacao = { de: string; para: string; cor: Cor };
export type Desenho = { caixas: Caixa[]; ligacoes: Ligacao[]; largura: number; altura: number };

/** Quebra o texto em linhas de até ~24 letras, sem cortar palavras curtas. */
export function quebrarLinhas(texto: string, max = LETRAS_POR_LINHA) {
  const linhas: string[] = [];
  let atual = "";
  for (const palavra of texto.split(/\s+/).filter(Boolean)) {
    if (!atual) atual = palavra;
    else if ((atual + " " + palavra).length <= max) atual += " " + palavra;
    else {
      linhas.push(atual);
      atual = palavra;
    }
  }
  if (atual) linhas.push(atual);
  return linhas.length ? linhas : [""];
}

function medir(texto: string, nivel: number) {
  const linhas = quebrarLinhas(texto, nivel === 0 ? 20 : LETRAS_POR_LINHA);
  const maior = Math.max(...linhas.map((l) => l.length));
  const letra = LARGURA_LETRA[Math.min(nivel, 3) as 0 | 1 | 2 | 3];
  const w = Math.round(Math.max(nivel === 0 ? 120 : 64, maior * letra + (nivel === 0 ? 40 : 28)));
  const h = linhas.length * ALTURA_LINHA + (nivel === 0 ? 28 : nivel === 1 ? 18 : 14);
  return { linhas, w, h };
}

type Medido = { no: No; nivel: number; linhas: string[]; w: number; h: number; filhos: Medido[]; alturaSub: number };

function medirArvore(no: No, nivel: number): Medido {
  const { linhas, w, h } = medir(no.texto, nivel);
  const filhos = no.filhos.map((f) => medirArvore(f, nivel + 1));
  const somaFilhos = filhos.reduce((s, f) => s + f.alturaSub, 0) + ESPACO_V * Math.max(0, filhos.length - 1);
  return { no, nivel, linhas, w, h, filhos, alturaSub: Math.max(h, somaFilhos) };
}

/** Calcula a posição de todas as caixas: ramos divididos entre direita e esquerda do centro. */
export function desenharMapa(mapa: Mapa): Desenho {
  const centro = medir(mapa.centro || "Tema", 0);
  const caixas: Caixa[] = [];
  const ligacoes: Ligacao[] = [];

  caixas.push({
    id: "centro",
    x: -centro.w / 2,
    y: -centro.h / 2,
    w: centro.w,
    h: centro.h,
    linhas: centro.linhas,
    nivel: 0,
    cor: null,
    lado: "centro",
  });

  // Metade dos ramos para cada lado; a direita fica com o ramo a mais.
  const meio = Math.ceil(mapa.ramos.length / 2);
  const lados: { ramos: Ramo[]; lado: "direita" | "esquerda" }[] = [
    { ramos: mapa.ramos.slice(0, meio), lado: "direita" },
    { ramos: mapa.ramos.slice(meio).reverse(), lado: "esquerda" },
  ];

  for (const { ramos, lado } of lados) {
    const medidos = ramos.map((r) => ({ cor: r.cor, m: medirArvore(r, 1) }));
    const total = medidos.reduce((s, r) => s + r.m.alturaSub, 0) + ESPACO_V * 2 * Math.max(0, medidos.length - 1);
    let topo = -total / 2;
    const bordaCentro = lado === "direita" ? centro.w / 2 : -centro.w / 2;

    const posicionar = (m: Medido, topoSub: number, borda: number, cor: Cor, pai: string) => {
      const y = topoSub + m.alturaSub / 2 - m.h / 2;
      const x = lado === "direita" ? borda + ESPACO_H : borda - ESPACO_H - m.w;
      caixas.push({ id: m.no.id, x, y, w: m.w, h: m.h, linhas: m.linhas, nivel: m.nivel, cor, lado });
      ligacoes.push({ de: pai, para: m.no.id, cor });

      const somaFilhos = m.filhos.reduce((s, f) => s + f.alturaSub, 0) + ESPACO_V * Math.max(0, m.filhos.length - 1);
      let t = topoSub + (m.alturaSub - somaFilhos) / 2;
      const bordaFilhos = lado === "direita" ? x + m.w : x;
      for (const f of m.filhos) {
        posicionar(f, t, bordaFilhos, cor, m.no.id);
        t += f.alturaSub + ESPACO_V;
      }
    };

    for (const { m, cor } of medidos) {
      posicionar(m, topo, bordaCentro, cor, "centro");
      topo += m.alturaSub + ESPACO_V * 2;
    }
  }

  // Move tudo para coordenadas positivas, com margem.
  const margem = 16;
  const minX = Math.min(...caixas.map((c) => c.x)) - margem;
  const minY = Math.min(...caixas.map((c) => c.y)) - margem;
  const maxX = Math.max(...caixas.map((c) => c.x + c.w)) + margem;
  const maxY = Math.max(...caixas.map((c) => c.y + c.h)) + margem;
  for (const c of caixas) {
    c.x = Math.round(c.x - minX);
    c.y = Math.round(c.y - minY);
  }
  return { caixas, ligacoes, largura: Math.round(maxX - minX), altura: Math.round(maxY - minY) };
}

/** Curva suave da borda do pai até a borda do filho. */
export function caminhoLigacao(pai: Caixa, filho: Caixa) {
  const direita = filho.lado === "direita";
  const x1 = direita ? pai.x + pai.w : pai.x;
  const y1 = pai.y + pai.h / 2;
  const x2 = direita ? filho.x : filho.x + filho.w;
  const y2 = filho.y + filho.h / 2;
  const meio = (x1 + x2) / 2;
  return `M${x1} ${y1}C${meio} ${y1} ${meio} ${y2} ${x2} ${y2}`;
}

/** Texto do mapa em tópicos, para leitores de tela e para copiar. */
export function mapaEmTopicos(mapa: Mapa) {
  const linhas = [mapa.centro];
  const andar = (n: No, nivel: number) => {
    linhas.push(`${"  ".repeat(nivel - 1)}- ${n.texto}`);
    n.filhos.forEach((f) => andar(f, nivel + 1));
  };
  mapa.ramos.forEach((r) => andar(r, 1));
  return linhas.join("\n");
}
