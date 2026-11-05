// Tira o texto de um PDF no próprio navegador (o arquivo não sai do aparelho).
// Funciona com PDF "digital", de onde dá para selecionar o texto. PDF escaneado (foto) não tem texto.

type ItemTexto = { str: string; transform: number[]; width?: number };

/** Junta os pedaços de texto em linhas, pela altura na página, e separa colunas com " - ". */
export function linhasDaPagina(itens: ItemTexto[]) {
  const linhas: { y: number; partes: { x: number; fim: number; texto: string }[] }[] = [];
  for (const i of itens) {
    if (!i.str.trim()) continue;
    const x = i.transform[4];
    const y = i.transform[5];
    let linha = linhas.find((l) => Math.abs(l.y - y) < 3);
    if (!linha) linhas.push((linha = { y, partes: [] }));
    linha.partes.push({ x, fim: x + (i.width ?? 0), texto: i.str });
  }
  return linhas
    .sort((a, b) => b.y - a.y)
    .map((l) => {
      const partes = l.partes.sort((a, b) => a.x - b.x);
      let texto = "";
      partes.forEach((p, n) => {
        if (n > 0) texto += p.x - partes[n - 1].fim > 20 ? " - " : " ";
        texto += p.texto;
      });
      return texto.replace(/\s+/g, " ").trim();
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
