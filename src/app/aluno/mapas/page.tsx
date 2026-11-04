import Link from "next/link";
import { temMapa } from "@/lib/pedidos";
import { exigirPapel } from "@/lib/perfil";
import { carregarResumosDoAluno } from "../dados";
import { LayoutConta } from "../LayoutConta";
import { ListaResumos } from "../ListaResumos";

export default async function MapasDoAluno() {
  await exigirPapel("aluno");
  const mapas = (await carregarResumosDoAluno()).filter(temMapa);

  return (
    <LayoutConta titulo="Meus mapas mentais" descricao="Os resumos que têm mapa mental, para revisar de relance.">
      <ListaResumos
        resumos={mapas}
        vazio="Nenhum mapa mental ainda. Ao criar ou editar um resumo, abra a parte de mapa mental e monte os ramos."
      />
      <Link href="/aluno/materias" className="mt-6 inline-block text-sm font-bold text-primaria hover:underline">
        Criar um mapa mental numa matéria
      </Link>
    </LayoutConta>
  );
}
