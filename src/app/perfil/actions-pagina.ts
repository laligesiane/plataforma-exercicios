"use server";

import { revalidatePath } from "next/cache";
import type { EstadoFormulario } from "@/components/ui/Mensagem";
import { normalizarApelido, problemaDoApelido } from "@/lib/paginaProfessor";
import { obterPerfil } from "@/lib/perfil";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export async function salvarPaginaProfessor(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const perfil = await obterPerfil();
  if (perfil?.papel !== "professor") return { erro: "Só professores têm página pública." };

  const texto = (campo: string, max: number) => String(formData.get(campo) ?? "").trim().slice(0, max);
  const apelido = normalizarApelido(String(formData.get("apelido") ?? ""));
  const nome = texto("nome", 80);
  const problema = problemaDoApelido(apelido);
  if (problema) return { erro: problema };
  if (!nome) return { erro: "Digite o nome que aparece na página." };

  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("pagina_professor").upsert(
    {
      professor_id: perfil.id,
      apelido,
      nome,
      bio: texto("bio", 1500),
      materias: texto("materias", 200),
      contato: texto("contato", 200),
      publicada: formData.get("publicada") === "on",
      atualizada_em: new Date().toISOString(),
    },
    { onConflict: "professor_id" },
  );
  if (error) {
    if (error.code === "23505") return { erro: "Esse endereço já é de outro professor. Escolha outro." };
    return { erro: "Não foi possível salvar a página." };
  }
  revalidatePath("/perfil");
  revalidatePath(`/p/${apelido}`);
  return { sucesso: formData.get("publicada") === "on" ? `Página salva e no ar em repasa.com.br/p/${apelido}.` : "Página salva como rascunho." };
}
