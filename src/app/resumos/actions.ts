"use server";

import { iaConfigurada } from "@/lib/pratica/gerar";
import { exigirLogin } from "@/lib/perfil";
import { ehTamanho } from "@/lib/resumo-ia/converter";
import { LIMITE_MATERIAL, LIMITE_PDF_ESCANEADO } from "@/lib/resumo-ia/extrair";
import { gerarResumo, type ResultadoResumo } from "@/lib/resumo-ia/gerar";
import { criarClienteServidor } from "@/lib/supabase/servidor";

/** Gerações com IA por pessoa a cada 24 horas (somadas com as práticas). */
const LIMITE_DIARIO = 20;
const MINIMO_DE_TEXTO = 150;

/** Gera um resumo a partir do texto de um PDF, slides, documento ou texto colado. Não salva nada. */
export async function gerarResumoDeMaterial(entrada: {
  texto?: string;
  pdfBase64?: string;
  nomeArquivo?: string;
  tamanho: string;
  cortado?: boolean;
}): Promise<ResultadoResumo> {
  await exigirLogin();
  if (!iaConfigurada()) return { ok: false, erro: "A geração com IA ainda não está ligada na Repasa." };
  const tamanho = ehTamanho(entrada.tamanho) ? entrada.tamanho : "medio";

  let material: { texto: string } | { pdfBase64: string };
  if (typeof entrada.pdfBase64 === "string" && entrada.pdfBase64) {
    if (entrada.pdfBase64.length > Math.ceil((LIMITE_PDF_ESCANEADO * 4) / 3) + 4 || !/^[A-Za-z0-9+/=]+$/.test(entrada.pdfBase64)) {
      return { ok: false, erro: "Esse PDF é grande demais para ler como imagem (até 3 MB)." };
    }
    material = { pdfBase64: entrada.pdfBase64 };
  } else {
    const texto = String(entrada.texto ?? "").replace(/\u0000/g, "").trim().slice(0, LIMITE_MATERIAL);
    if (texto.replace(/\s/g, "").length < MINIMO_DE_TEXTO) {
      return { ok: false, erro: "Tem pouco texto para resumir. Envie um material maior ou cole mais conteúdo." };
    }
    material = { texto };
  }

  const supabase = await criarClienteServidor();
  const desde = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase.from("geracao_ia").select("id", { count: "exact", head: true }).gte("criada_em", desde);
  if ((count ?? 0) >= LIMITE_DIARIO) {
    return { ok: false, erro: `Você já usou a IA ${LIMITE_DIARIO} vezes nas últimas 24 horas. Volte amanhã para gerar mais.` };
  }
  const { error } = await supabase.from("geracao_ia").insert({});
  if (error) return { ok: false, erro: "Não foi possível gerar agora. Tente de novo." };

  return gerarResumo({
    material,
    nomeArquivo: String(entrada.nomeArquivo ?? ""),
    tamanho,
    cortado: Boolean(entrada.cortado),
  });
}
