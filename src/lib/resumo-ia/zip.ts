// Leitor mínimo de arquivos .zip (PPTX e DOCX são zips de XML), sem biblioteca.
// Descompacta com o DecompressionStream do próprio navegador.

export type EntradaZip = { nome: string; ler: () => Promise<Uint8Array> };

async function inflar(dados: Uint8Array): Promise<Uint8Array> {
  const fluxo = new Blob([dados as BlobPart]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(fluxo).arrayBuffer());
}

/** Lista os arquivos de dentro do zip. Lança erro se não for um zip. */
export function lerZip(buffer: ArrayBuffer): EntradaZip[] {
  const bytes = new Uint8Array(buffer);
  const v = new DataView(buffer);
  // Fim do diretório central: procura de trás para frente (pode ter comentário no fim).
  let fim = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 22 - 65535); i--) {
    if (v.getUint32(i, true) === 0x06054b50) {
      fim = i;
      break;
    }
  }
  if (fim < 0) throw new Error("não é zip");
  const total = v.getUint16(fim + 10, true);
  let p = v.getUint32(fim + 16, true);
  const nomes = new TextDecoder();
  const entradas: EntradaZip[] = [];
  for (let n = 0; n < total; n++) {
    if (p + 46 > bytes.length || v.getUint32(p, true) !== 0x02014b50) throw new Error("zip corrompido");
    const metodo = v.getUint16(p + 10, true);
    const tamanho = v.getUint32(p + 20, true);
    const tamNome = v.getUint16(p + 28, true);
    const tamExtra = v.getUint16(p + 30, true);
    const tamComentario = v.getUint16(p + 32, true);
    const local = v.getUint32(p + 42, true);
    const nome = nomes.decode(bytes.subarray(p + 46, p + 46 + tamNome));
    p += 46 + tamNome + tamExtra + tamComentario;
    entradas.push({
      nome,
      ler: async () => {
        if (v.getUint32(local, true) !== 0x04034b50) throw new Error("zip corrompido");
        const inicio = local + 30 + v.getUint16(local + 26, true) + v.getUint16(local + 28, true);
        const dados = bytes.subarray(inicio, inicio + tamanho);
        if (metodo === 0) return dados;
        if (metodo === 8) return inflar(dados);
        throw new Error("compressão não suportada");
      },
    });
  }
  return entradas;
}
