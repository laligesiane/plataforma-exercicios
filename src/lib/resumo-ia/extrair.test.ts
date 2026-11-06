import { deflateRawSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { decodificarXml, juntarPartes, LIMITE_MATERIAL, paragrafosDoXml, textoDoDocx, textoDoPptx } from "./extrair";

/** Monta um .zip simples (com deflate) para os testes. */
function zip(arquivos: Record<string, string>): ArrayBuffer {
  const enc = new TextEncoder();
  const locais: Uint8Array[] = [];
  const centrais: Uint8Array[] = [];
  let deslocamento = 0;
  for (const [nome, conteudo] of Object.entries(arquivos)) {
    const n = enc.encode(nome);
    const dados = new Uint8Array(deflateRawSync(enc.encode(conteudo)));
    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(8, 8, true);
    local.setUint32(18, dados.length, true);
    local.setUint16(26, n.length, true);
    locais.push(new Uint8Array(local.buffer), n, dados);
    const central = new DataView(new ArrayBuffer(46));
    central.setUint32(0, 0x02014b50, true);
    central.setUint16(10, 8, true);
    central.setUint32(20, dados.length, true);
    central.setUint16(28, n.length, true);
    central.setUint32(42, deslocamento, true);
    centrais.push(new Uint8Array(central.buffer), n);
    deslocamento += 30 + n.length + dados.length;
  }
  const tamCentral = centrais.reduce((s, c) => s + c.length, 0);
  const fim = new DataView(new ArrayBuffer(22));
  fim.setUint32(0, 0x06054b50, true);
  fim.setUint16(8, Object.keys(arquivos).length, true);
  fim.setUint16(10, Object.keys(arquivos).length, true);
  fim.setUint32(12, tamCentral, true);
  fim.setUint32(16, deslocamento, true);
  const partes = [...locais, ...centrais, new Uint8Array(fim.buffer)];
  const total = new Uint8Array(partes.reduce((s, p) => s + p.length, 0));
  let p = 0;
  for (const parte of partes) {
    total.set(parte, p);
    p += parte.length;
  }
  return total.buffer;
}

const slide = (...paragrafos: string[]) =>
  `<p:sld><p:txBody>${paragrafos.map((t) => `<a:p><a:pPr lvl="0"/><a:r><a:rPr lang="pt-BR"/><a:t>${t}</a:t></a:r></a:p>`).join("")}<a:p/></p:txBody></p:sld>`;

describe("paragrafosDoXml", () => {
  it("junta os pedaços de cada parágrafo e decodifica entidades", () => {
    const xml = '<a:p><a:r><a:t>Água &amp; </a:t></a:r><a:r><a:t xml:space="preserve">sais</a:t></a:r></a:p><a:p><a:pPr/></a:p>';
    expect(paragrafosDoXml(xml, "a:p", "a:t")).toEqual(["Água & sais"]);
    expect(decodificarXml("&#233;&#x00E7;&lt;")).toBe("éç<");
  });
});

describe("textoDoPptx", () => {
  it("lê os slides na ordem certa, com as notas do apresentador", async () => {
    const arquivo = zip({
      "ppt/slides/slide10.xml": slide("Conclusão"),
      "ppt/slides/slide2.xml": slide("Causas", "Crise econômica"),
      "ppt/notesSlides/notesSlide2.xml": slide("Explicar a crise do pão", "2"),
      "ppt/slides/slide1.xml": slide("Revolução Francesa"),
      "[Content_Types].xml": "<Types/>",
    });
    const partes = await textoDoPptx(arquivo);
    expect(partes).toEqual([
      "[Slide 1]\nRevolução Francesa",
      "[Slide 2]\nCausas\nCrise econômica\nNotas do apresentador:\nExplicar a crise do pão",
      "[Slide 10]\nConclusão",
    ]);
  });
});

describe("textoDoDocx", () => {
  it("lê os parágrafos do Word", async () => {
    const arquivo = zip({
      "word/document.xml":
        '<w:document><w:body><w:p><w:r><w:t>Capítulo 1</w:t></w:r></w:p><w:p><w:r><w:t xml:space="preserve">Texto </w:t></w:r><w:r><w:tab/><w:t>aqui</w:t></w:r></w:p></w:body></w:document>',
    });
    expect(await textoDoDocx(arquivo)).toEqual(["Capítulo 1\nTexto aqui"]);
  });
});

describe("juntarPartes", () => {
  it("corta no limite e avisa", () => {
    const r = juntarPartes(["a".repeat(LIMITE_MATERIAL), "b"]);
    expect(r).toMatchObject({ tipo: "texto", cortado: true, partes: 2 });
    if (r.tipo === "texto") expect(r.texto.length).toBe(LIMITE_MATERIAL);
  });
});
