import type { Mapa } from "@/lib/mapas";

export type Resumo = {
  id: string;
  turma_id: string;
  aula_id: string | null;
  titulo: string;
  texto: string;
  mapa: Mapa;
  atualizado_em: string;
};

export const camposResumo = "id, turma_id, aula_id, titulo, texto, mapa, atualizado_em";

export function tituloResumo(r: Pick<Resumo, "titulo" | "mapa">) {
  return r.titulo.trim() || r.mapa?.centro?.trim() || "Resumo sem título";
}
