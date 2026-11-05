import { redirect } from "next/navigation";

/** "Minhas matérias" virou "Meus cursos": as matérias ficam dentro de cada curso. O endereço antigo continua valendo. */
export default async function MateriasDoAluno({ searchParams }: { searchParams: Promise<{ curso?: string }> }) {
  const { curso } = await searchParams;
  redirect(curso ? `/aluno/cursos/${encodeURIComponent(curso)}` : "/aluno/cursos");
}
