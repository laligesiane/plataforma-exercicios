import { exigirPapel } from "@/lib/perfil";
import { LayoutConta } from "../LayoutConta";
import { ModoFoco } from "./ModoFoco";

export const metadata = { title: "Modo foco · Repasa" };

export default async function PaginaModoFoco() {
  await exigirPapel("aluno");
  return (
    <LayoutConta titulo="Modo foco" descricao="Escolha um tempo e estude sem sair desta página. O Brotinho cresce junto com você.">
      <ModoFoco />
    </LayoutConta>
  );
}
