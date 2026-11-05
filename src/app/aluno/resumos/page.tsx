import { redirect } from "next/navigation";

/** A lista de resumos agora mora dentro de Matérias (cada matéria e as turmas). O endereço antigo continua valendo. */
export default function ResumosDoAluno() {
  redirect("/aluno/materias#das-turmas");
}
