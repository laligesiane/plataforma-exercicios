import { chegouAoLimite, limite } from "@/lib/limites";
import { exigirPapel } from "@/lib/perfil";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { CartaoMateria } from "../CartaoMateria";
import { LayoutConta } from "../LayoutConta";
import { FormularioMateria } from "./FormularioMateria";

export default async function MateriasDoAluno() {
  const perfil = await exigirPapel("aluno");
  const supabase = await criarClienteServidor();
  const [{ data }, { data: plano }] = await Promise.all([
    supabase.from("materia").select("id, nome, cor, resumo(count)").order("criada_em"),
    supabase.from("plano").select("max_materias").eq("id", perfil.plano_id).single(),
  ]);
  const materias = data ?? [];
  const maxMaterias = limite(plano?.max_materias);

  return (
    <LayoutConta titulo="Minhas matérias" descricao="Organize seus resumos e mapas mentais por matéria. Só você vê.">
      {materias.length > 0 && (
        <ul className="mt-8 grid gap-3 sm:grid-cols-3">
          {materias.map((m) => (
            <li key={m.id}>
              <CartaoMateria
                id={m.id}
                nome={m.nome}
                cor={m.cor}
                total={(m.resumo as unknown as { count: number }[])[0]?.count ?? 0}
              />
            </li>
          ))}
        </ul>
      )}
      {!chegouAoLimite(materias.length, plano?.max_materias) ? (
        <details className="mt-4 rounded-2xl border border-linha p-5" open={materias.length === 0}>
          <summary className="cursor-pointer font-bold text-primaria">Nova matéria</summary>
          <p className="mt-2 mb-4 text-sm text-tinta-suave">
            Crie matérias para guardar seus resumos e mapas mentais.
            {maxMaterias != null && ` Seu plano inclui ${maxMaterias}.`}
          </p>
          <FormularioMateria />
        </details>
      ) : (
        <p className="mt-4 text-sm text-tinta-suave">Você está usando as {maxMaterias} matérias do seu plano.</p>
      )}
    </LayoutConta>
  );
}
