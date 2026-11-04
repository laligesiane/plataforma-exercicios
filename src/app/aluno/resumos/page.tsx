import Link from "next/link";
import { exigirPapel } from "@/lib/perfil";
import { carregarResumosDoAluno } from "../dados";
import { LayoutConta } from "../LayoutConta";
import { ListaResumos } from "../ListaResumos";

export default async function ResumosDoAluno() {
  await exigirPapel("aluno");
  const resumos = await carregarResumosDoAluno();

  return (
    <LayoutConta titulo="Meus resumos" descricao="Os seus resumos e os que os professores compartilharam nas turmas.">
      <ListaResumos
        resumos={resumos}
        vazio="Nenhum resumo ainda. Crie uma matéria e escreva o primeiro."
      />
      <Link href="/aluno/materias" className="mt-6 inline-block text-sm font-bold text-primaria hover:underline">
        Criar um resumo numa matéria
      </Link>
    </LayoutConta>
  );
}
