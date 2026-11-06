import { obterDicionario } from "@/i18n/servidor";
import { exigirPapel } from "@/lib/perfil";
import { LayoutConta } from "../LayoutConta";
import { ModoFoco } from "./ModoFoco";

export async function generateMetadata() {
  const d = await obterDicionario();
  return { title: `${d.foco.titulo} · Repasa` };
}

export default async function PaginaModoFoco() {
  await exigirPapel("aluno");
  const t = (await obterDicionario()).foco;
  return (
    <LayoutConta titulo={t.titulo} descricao={t.descricao}>
      <ModoFoco />
    </LayoutConta>
  );
}
