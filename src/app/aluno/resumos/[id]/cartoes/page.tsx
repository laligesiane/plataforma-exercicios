import { redirect } from "next/navigation";

/** Os cartões agora ficam junto com os outros jogos do resumo. */
export default async function CartoesDoResumo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/aluno/resumos/${id}/jogar/cartoes`);
}
