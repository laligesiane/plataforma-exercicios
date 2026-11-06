"use server";

import { avisoPalavrao } from "@/lib/palavroes/servidor";
import { revalidatePath } from "next/cache";
import type { EstadoFormulario } from "@/components/ui/Mensagem";
import { MODALIDADES, normalizarApelido, normalizarRede, problemaDaRede, problemaDoApelido, REDES, type Rede } from "@/lib/paginaProfessor";
import { obterPerfil } from "@/lib/perfil";
import { lerCorResumo } from "@/lib/resumos";
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

  const redes = {} as Record<Rede, string>;
  for (const rede of REDES) {
    redes[rede] = normalizarRede(rede, texto(rede, 200));
    const erro = problemaDaRede(rede, redes[rede]);
    if (erro) return { erro };
  }

  const anoAtual = new Date().getFullYear();
  const desdeTexto = texto("ensina_desde", 4);
  const ensinaDesde = desdeTexto ? Number(desdeTexto) : null;
  if (ensinaDesde !== null && (!Number.isInteger(ensinaDesde) || ensinaDesde < 1950 || ensinaDesde > anoAtual)) {
    return { erro: `Digite o ano em que começou a ensinar, entre 1950 e ${anoAtual}.` };
  }
  const modalidade = texto("modalidade", 20);
  const palavrao = await avisoPalavrao(apelido, nome, ...["destaque", "bio", "materias", "formacao", "cidade", "contato"].map((c) => texto(c, 1500)));
  if (palavrao) return { erro: palavrao };

  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("pagina_professor").upsert(
    {
      professor_id: perfil.id,
      apelido,
      nome,
      destaque: texto("destaque", 120),
      bio: texto("bio", 1500),
      materias: texto("materias", 200),
      formacao: texto("formacao", 300),
      cidade: texto("cidade", 80),
      modalidade: modalidade in MODALIDADES ? modalidade : "",
      ensina_desde: ensinaDesde,
      contato: texto("contato", 200),
      ...redes,
      cor: lerCorResumo(formData.get("cor")),
      publicada: formData.get("publicada") === "on",
      atualizada_em: new Date().toISOString(),
    },
    { onConflict: "professor_id" },
  );
  if (error) {
    if (error.code === "23505") return { erro: "Esse endereço já é de outro professor. Escolha outro." };
    if (error.code === "PGRST204" || error.code === "42703") return { erro: "Falta rodar o SQL 0038 no Supabase para salvar os campos novos." };
    return { erro: "Não foi possível salvar a página." };
  }
  revalidatePath("/perfil");
  revalidatePath(`/p/${apelido}`);
  return { sucesso: formData.get("publicada") === "on" ? `Página salva e no ar em repasa.com.br/p/${apelido}.` : "Página salva como rascunho." };
}
