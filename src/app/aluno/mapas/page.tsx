import { redirect } from "next/navigation";

/** Os mapas mentais agora ficam dentro de cada matéria (filtro "Mapas mentais"). O endereço antigo continua valendo. */
export default function MapasDoAluno() {
  redirect("/aluno/materias");
}
