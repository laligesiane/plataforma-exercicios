import { exigirPapel } from "@/lib/perfil";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { CartaoMateria } from "../CartaoMateria";
import { LayoutConta } from "../LayoutConta";
import { FormularioMateria } from "./FormularioMateria";

export default async function MateriasDoAluno() {
  await exigirPapel("aluno");
  const supabase = await criarClienteServidor();
  const { data } = await supabase.from("materia").select("id, nome, cor, resumo(count)").order("criada_em");
  const materias = data ?? [];

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
      {materias.length < 3 ? (
        <details className="mt-4 rounded-2xl border border-linha p-5" open={materias.length === 0}>
          <summary className="cursor-pointer font-bold text-primaria">Nova matéria</summary>
          <p className="mt-2 mb-4 text-sm text-tinta-suave">
            Crie matérias para guardar seus resumos e mapas mentais. O plano grátis inclui 3.
          </p>
          <FormularioMateria />
        </details>
      ) : (
        <p className="mt-4 text-sm text-tinta-suave">Você está usando as 3 matérias do plano grátis.</p>
      )}
    </LayoutConta>
  );
}
