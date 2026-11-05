// Tira o texto de um PDF no próprio navegador (o arquivo não sai do aparelho).
// Funciona com PDF "digital", de onde dá para selecionar o texto. PDF escaneado (foto) não tem texto.

type ItemTexto = { str: string; transform: number[]; width?: number; height?: number };

type Caixa = { x: number; y: number; fim: number; altura: number; texto: string; ultimoY: number };

/** Linha que termina "pendurada" (em "-", "/", "e", "da"...) continua na linha de baixo. */
const terminaPendurado = /(\s[-–\/,;]|\s(e|de|da|do|das|dos|para|a|o|com|ao|em|na|no))\s*$/i;
const comecaContinuacao = /^\s*([\/,;]|\p{Ll})/u;
const soNomeDeMes = /^\s*(janeiro|fevereiro|mar[cç]o|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s*$/i;

/** Junta o texto que quebrou em duas linhas na mesma coluna ("... ADAPTAÇÃO E" + "DEPENDÊNCIA"). */
function juntarQuebras(caixas: Caixa[]) {
  const ordem = [...caixas].sort((a, b) => b.y - a.y || a.x - b.x);
  const usadas = new Set<Caixa>();
  for (const a of ordem) {
    if (usadas.has(a)) continue;
    for (;;) {
      const b = ordem.find(
        (c) =>
          c !== a &&
          !usadas.has(c) &&
          Math.abs(c.x - a.x) <= 2 &&
          c.y < a.ultimoY &&
          a.ultimoY - c.y <= 1.7 * Math.max(a.altura, c.altura),
      );
      if (!b || !(terminaPendurado.test(a.texto) || comecaContinuacao.test(b.texto))) break;
      a.texto = `${a.texto} ${b.texto}`;
      a.fim = Math.max(a.fim, b.fim);
      a.ultimoY = b.y;
      usadas.add(b);
    }
  }
  return caixas.filter((c) => !usadas.has(c));
}

/**
 * Tabela de feriados com o mês numa coluna à esquerda, centralizado na altura das suas linhas
 * ("OUTUBRO" no meio de "12 - ..." e "15 - ..."): cada linha vai para o mês mais perto,
 * e o mês sobe para a altura da primeira linha dele, para ser lido antes delas.
 */
function alinharMeses(caixas: Caixa[]) {
  const meses = caixas.filter((c) => soNomeDeMes.test(c.texto));
  if (meses.length === 0) return;
  const primeira = new Map<Caixa, number>();
  for (const r of caixas) {
    if (meses.includes(r) || !/\p{L}{3}/u.test(r.texto)) continue;
    let melhor: Caixa | null = null;
    for (const m of meses) {
      const dx = r.x - m.fim;
      const dy = Math.abs(r.y - m.y);
      if (dx <= 0 || dx > 60 || dy > 2.5 * Math.max(m.altura, r.altura)) continue;
      if (!melhor || dy < Math.abs(r.y - melhor.y)) melhor = m;
    }
    if (melhor) primeira.set(melhor, Math.max(primeira.get(melhor) ?? -Infinity, r.y));
  }
  for (const [m, y] of primeira) m.y = y;
}

/**
 * Junta os pedaços de texto em linhas, pela altura na página.
 * Colunas separadas (espaço grande entre os pedaços) ficam separadas por tab, para o leitor
 * não misturar, por exemplo, a grade dos meses com o cronograma ao lado.
 */
export function linhasDaPagina(itens: ItemTexto[]) {
  let caixas: Caixa[] = itens
    .filter((i) => i.str.trim())
    .map((i) => ({
      x: i.transform[4],
      y: i.transform[5],
      fim: i.transform[4] + (i.width ?? 0),
      altura: i.height || Math.abs(i.transform[3]) || 10,
      texto: i.str,
      ultimoY: i.transform[5],
    }));
  caixas = juntarQuebras(caixas);
  alinharMeses(caixas);

  const linhas: { y: number; partes: Caixa[] }[] = [];
  for (const c of caixas) {
    let linha = linhas.find((l) => Math.abs(l.y - c.y) < 3);
    if (!linha) linhas.push((linha = { y: c.y, partes: [] }));
    linha.partes.push(c);
  }
  return linhas
    .sort((a, b) => b.y - a.y)
    .map((l) => {
      const partes = l.partes.sort((a, b) => a.x - b.x);
      let texto = "";
      partes.forEach((p, n) => {
        if (n > 0) texto += p.x - partes[n - 1].fim > 20 ? "\t" : " ";
        texto += p.texto.replace(/\s+/g, " ").trim();
      });
      return texto.replace(/ +/g, " ").trim();
    });
}

export async function textoDoPdf(arquivo: File) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  const tarefa = pdfjs.getDocument({ data: new Uint8Array(await arquivo.arrayBuffer()) });
  const doc = await tarefa.promise;
  const paginas: string[] = [];
  for (let n = 1; n <= Math.min(doc.numPages, 30); n++) {
    const pagina = await doc.getPage(n);
    const conteudo = await pagina.getTextContent();
    paginas.push(linhasDaPagina(conteudo.items as ItemTexto[]).join("\n"));
  }
  await tarefa.destroy();
  return paginas.join("\n");
}
