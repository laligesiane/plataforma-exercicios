// Tira o texto de PDF, PowerPoint (.pptx), Word (.docx) ou texto puro, no próprio navegador.
// Só o texto segue para gerar o resumo; o arquivo em si não sai do aparelho
// (a não ser um PDF escaneado, sem texto, que precisa ser lido como imagem).

import { lerZip } from "./zip";

/** Teto do texto enviado para a IA (mais ou menos 40 páginas de apostila). */
export const LIMITE_MATERIAL = 80_000;
/** PDF sem texto até esse tamanho pode ser lido como imagem pela IA. */
export const LIMITE_PDF_ESCANEADO = 3 * 1024 * 1024;

export const aceitos = ".pdf,.pptx,.docx,.txt,.md";

export type Material =
  | { tipo: "texto"; texto: string; cortado: boolean; partes: number }
  | { tipo: "pdf-escaneado"; base64: string }
  | { tipo: "erro"; erro: string };

const entidades: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

export function decodificarXml(texto: string) {
  return texto.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_, e: string) => {
    if (e[0] === "#") {
      const n = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : "";
    }
    return entidades[e.toLowerCase()] ?? "";
  });
}

/**
 * Texto de um XML do Office: um parágrafo por linha, juntando os pedaços de texto dele.
 * `p` é a tag do parágrafo (a:p nos slides, w:p no Word) e `t` a do texto (a:t, w:t).
 */
export function paragrafosDoXml(xml: string, p: string, t: string) {
  const linhas: string[] = [];
  const reP = new RegExp(`<${p}(?:\\s[^>]*)?>([\\s\\S]*?)</${p}>`, "g");
  const reT = new RegExp(`<${t}(?:\\s[^>]*)?>([\\s\\S]*?)</${t}>|<(?:${t.split(":")[0]}:)?(tab|br)\\b[^>]*/>`, "g");
  for (const [, dentro] of xml.matchAll(reP)) {
    let linha = "";
    for (const m of dentro.matchAll(reT)) linha += m[1] !== undefined ? decodificarXml(m[1]) : " ";
    linha = linha.replace(/\s+/g, " ").trim();
    if (linha) linhas.push(linha);
  }
  return linhas;
}

const numero = (nome: string) => Number(nome.match(/(\d+)\.xml$/)?.[1] ?? 0);

async function xml(ler: () => Promise<Uint8Array>) {
  return new TextDecoder().decode(await ler());
}

export async function textoDoPptx(buffer: ArrayBuffer) {
  const entradas = lerZip(buffer);
  const slides = entradas.filter((e) => /^ppt\/slides\/slide\d+\.xml$/.test(e.nome)).sort((a, b) => numero(a.nome) - numero(b.nome));
  const notas = new Map(
    entradas.filter((e) => /^ppt\/notesSlides\/notesSlide\d+\.xml$/.test(e.nome)).map((e) => [numero(e.nome), e]),
  );
  const partes: string[] = [];
  for (const s of slides) {
    const linhas = paragrafosDoXml(await xml(s.ler), "a:p", "a:t");
    const nota = notas.get(numero(s.nome));
    // A nota do apresentador repete o número do slide num parágrafo sozinho: tira os números soltos.
    const linhasNota = nota ? paragrafosDoXml(await xml(nota.ler), "a:p", "a:t").filter((l) => !/^\d+$/.test(l)) : [];
    if (!linhas.length && !linhasNota.length) continue;
    partes.push(
      [`[Slide ${numero(s.nome)}]`, ...linhas, ...(linhasNota.length ? ["Notas do apresentador:", ...linhasNota] : [])].join("\n"),
    );
  }
  return partes;
}

export async function textoDoDocx(buffer: ArrayBuffer) {
  const doc = lerZip(buffer).find((e) => e.nome === "word/document.xml");
  if (!doc) throw new Error("sem documento");
  return [paragrafosDoXml(await xml(doc.ler), "w:p", "w:t").join("\n")];
}

async function textoDoPdf(buffer: ArrayBuffer) {
  const [{ linhasDaPagina }, pdfjs] = await Promise.all([import("../importar-calendario/pdf"), import("pdfjs-dist")]);
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  const tarefa = pdfjs.getDocument({ data: new Uint8Array(buffer.slice(0)) });
  const doc = await tarefa.promise;
  const partes: string[] = [];
  let total = 0;
  for (let n = 1; n <= Math.min(doc.numPages, 200) && total < LIMITE_MATERIAL; n++) {
    const pagina = await doc.getPage(n);
    const conteudo = await pagina.getTextContent();
    const texto = linhasDaPagina(conteudo.items as Parameters<typeof linhasDaPagina>[0])
      .join("\n")
      .replace(/\t/g, "  ")
      .trim();
    if (texto) {
      partes.push(`[Página ${n}]\n${texto}`);
      total += texto.length;
    }
  }
  await tarefa.destroy();
  return partes;
}

function base64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binario = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binario += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binario);
}

/** Junta as partes e corta no limite, sem quebrar no meio de uma parte se der. */
export function juntarPartes(partes: string[]): Material {
  const limpas = partes.map((p) => p.trim()).filter(Boolean);
  let texto = limpas.join("\n\n");
  const cortado = texto.length > LIMITE_MATERIAL;
  if (cortado) texto = texto.slice(0, LIMITE_MATERIAL);
  return { tipo: "texto", texto, cortado, partes: limpas.length };
}

const pouco = (partes: string[]) => partes.join("").replace(/\[(Slide|Página) \d+\]|\s/g, "").length < 100;

export async function materialDoArquivo(arquivo: File): Promise<Material> {
  const nome = arquivo.name.toLowerCase();
  const ext = nome.slice(nome.lastIndexOf(".") + 1);
  try {
    if (ext === "txt" || ext === "md" || arquivo.type.startsWith("text/")) return juntarPartes([await arquivo.text()]);
    const buffer = await arquivo.arrayBuffer();
    if (ext === "pdf" || arquivo.type === "application/pdf") {
      const partes = await textoDoPdf(buffer);
      if (!pouco(partes)) return juntarPartes(partes);
      if (arquivo.size <= LIMITE_PDF_ESCANEADO) return { tipo: "pdf-escaneado", base64: base64(buffer) };
      return {
        tipo: "erro",
        erro: "Esse PDF parece ser uma foto ou digitalização, sem texto para copiar, e é grande demais para ler como imagem (até 3 MB). Tente um PDF menor ou cole o texto.",
      };
    }
    if (ext === "pptx") {
      const partes = await textoDoPptx(buffer);
      if (pouco(partes)) return { tipo: "erro", erro: "Não achei texto nesses slides. Se forem só imagens, exporte como PDF e tente de novo." };
      return juntarPartes(partes);
    }
    if (ext === "docx") return juntarPartes(await textoDoDocx(buffer));
    if (ext === "ppt" || ext === "doc") {
      return { tipo: "erro", erro: "Esse formato é antigo. Abra o arquivo e salve como .pptx, .docx ou PDF." };
    }
    if (ext === "key" || ext === "pages" || ext === "odp" || ext === "odt") {
      return { tipo: "erro", erro: "Exporte o arquivo como PDF ou PowerPoint (.pptx) e envie de novo." };
    }
    return { tipo: "erro", erro: "Envie um PDF, slides em PowerPoint (.pptx), um documento do Word (.docx) ou um .txt." };
  } catch {
    return { tipo: "erro", erro: "Não consegui abrir esse arquivo. Ele pode estar protegido por senha ou danificado." };
  }
}
