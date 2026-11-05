"use server";

import { redirect } from "next/navigation";
import type { EstadoFormulario } from "@/components/ui/Mensagem";
import { criarClienteAdmin } from "@/lib/supabase/admin";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const PALAVRA = "EXCLUIR";

/** Apaga todos os arquivos guardados na pasta da pessoa (primeiro nível = id dela), em qualquer profundidade. */
async function apagarPasta(admin: ReturnType<typeof criarClienteAdmin>, bucket: string, pasta: string) {
  const caminhos: string[] = [];
  const pendentes = [pasta];
  while (pendentes.length) {
    const atual = pendentes.pop()!;
    for (let pagina = 0; ; pagina++) {
      const { data } = await admin.storage.from(bucket).list(atual, { limit: 1000, offset: pagina * 1000 });
      if (!data?.length) break;
      for (const item of data) {
        // Pastas vêm sem id; arquivos têm id.
        if (item.id) caminhos.push(`${atual}/${item.name}`);
        else pendentes.push(`${atual}/${item.name}`);
      }
      if (data.length < 1000) break;
    }
  }
  for (let i = 0; i < caminhos.length; i += 1000) {
    await admin.storage.from(bucket).remove(caminhos.slice(i, i + 1000));
  }
}

/**
 * Exclui a conta de quem está logado (direito do usuário pela LGPD). Apagar o usuário do Auth apaga o perfil
 * e, em cascata no banco, tudo o que é dele: turmas, atividades, matérias, resumos, respostas e o resto.
 */
export async function excluirConta(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  if (String(formData.get("confirmacao") ?? "").trim().toUpperCase() !== PALAVRA) {
    return { erro: `Para confirmar, digite ${PALAVRA} no campo.` };
  }

  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erro: "Sua sessão expirou. Entre de novo para excluir a conta." };

  const admin = criarClienteAdmin();
  try {
    await Promise.all([apagarPasta(admin, "midia", user.id), apagarPasta(admin, "producao", user.id)]);
  } catch {
    // Arquivos que sobrarem não impedem a exclusão; sem a conta, ninguém mais chega neles pelo app.
  }

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return { erro: "Não foi possível excluir a conta agora. Tente de novo ou escreva para o suporte." };

  await supabase.auth.signOut();
  redirect("/?conta=excluida");
}
