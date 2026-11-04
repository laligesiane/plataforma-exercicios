import "server-only";
import type { Correcao, ProducaoSalva } from "@/components/exercicios/Producao";
import type { criarClienteServidor } from "@/lib/supabase/servidor";

export type LinhaProducao = {
  item_id?: string;
  texto: string;
  audio: string | null;
  enviada_em: string;
  correcao: { avaliacao: Correcao["avaliacao"]; comentario: string; corrigida_em: string } | null;
};

/** Converte as linhas do banco no formato da página, com links temporários (2 h) para os áudios. */
export async function montarProducoes(
  supabase: Awaited<ReturnType<typeof criarClienteServidor>>,
  linhas: LinhaProducao[],
): Promise<[string, ProducaoSalva][]> {
  const caminhos = linhas.flatMap((l) => (l.audio ? [l.audio] : []));
  const links = new Map<string, string>();
  if (caminhos.length > 0) {
    const { data } = await supabase.storage.from("producao").createSignedUrls(caminhos, 2 * 60 * 60);
    for (const d of data ?? []) if (d.path && d.signedUrl) links.set(d.path, d.signedUrl);
  }
  return linhas.map((l) => {
    const c = Array.isArray(l.correcao) ? l.correcao[0] : l.correcao;
    return [
      l.item_id ?? "",
      {
        texto: l.texto,
        audioUrl: l.audio ? (links.get(l.audio) ?? null) : null,
        enviadaEm: l.enviada_em,
        correcao: c ? { avaliacao: c.avaliacao, comentario: c.comentario, anterior: Date.parse(c.corrigida_em) < Date.parse(l.enviada_em) } : null,
      },
    ];
  });
}
