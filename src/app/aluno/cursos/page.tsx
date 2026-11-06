import { chegouAoLimite, limite } from "@/lib/limites";
import { exigirPapel } from "@/lib/perfil";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { carregarResumosDoAluno } from "../dados";
import { LayoutConta } from "../LayoutConta";
import { ListaResumos } from "../ListaResumos";
import { FormularioCurso } from "../materias/FormularioCurso";
import { FormularioMateria } from "../materias/FormularioMateria";
import { CartaoCurso } from "./CartaoCurso";
import { carregarCursos, SEM_CURSO } from "./dados";

export default async function MeusCursos() {
  const perfil = await exigirPapel("aluno");
  const supabase = await criarClienteServidor();
  const [{ cursos, semCurso, resumosSemCurso, totalMaterias }, { data: plano }, todosResumos] = await Promise.all([
    carregarCursos(),
    supabase.from("plano").select("max_materias").eq("id", perfil.plano_id).single(),
    carregarResumosDoAluno(),
  ]);
  // Resumos e mapas que os professores compartilharam nas turmas (não pertencem a uma matéria do aluno).
  const dasTurmas = todosResumos.filter((r) => r.turma_id);
  const maxMaterias = limite(plano?.max_materias);
  const podeCriar = !chegouAoLimite(totalMaterias, plano?.max_materias);
  const nada = cursos.length === 0 && semCurso.length === 0;

  return (
    <LayoutConta
      titulo="Meus cursos"
      descricao="Cada curso junta suas matérias (ex.: Espanhol, Faculdade, Ensino médio). Toque num curso para ver as matérias. Só você vê."
    >
      {!nada && (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cursos.map((c) => (
            <li key={c.id}>
              <CartaoCurso
                href={`/aluno/cursos/${c.id}`}
                nome={c.nome}
                materias={c.materias.length}
                resumos={c.resumos}
                coresMaterias={c.materias.map((m) => m.cor)}
                inicio={c.inicio}
                duracaoMeses={c.duracao_meses}
                etapa={c.etapa}
              />
            </li>
          ))}
          {semCurso.length > 0 && (
            <li>
              <CartaoCurso
                href={`/aluno/cursos/${SEM_CURSO}`}
                nome="Sem curso"
                materias={semCurso.length}
                resumos={resumosSemCurso}
                coresMaterias={semCurso.map((m) => m.cor)}
                discreto
              />
            </li>
          )}
        </ul>
      )}

      {nada && (
        <p className="mt-6 rounded-3xl border border-dashed border-linha p-5 text-sm text-tinta-suave">
          Você ainda não tem cursos. Crie o primeiro, por exemplo “Faculdade” ou “Espanhol”, e depois coloque as
          matérias dentro dele.
        </p>
      )}

      <div className="mt-8 space-y-3">
        <details className="rounded-2xl border border-linha p-5" open={nada}>
          <summary className="cursor-pointer font-bold text-primaria">Novo curso</summary>
          <p className="mt-2 mb-4 text-sm text-tinta-suave">
            Um curso junta várias matérias. Por exemplo: o curso “Faculdade” com as matérias Cálculo e Física, ou
            “Espanhol” com Gramática e Vocabulário. Se quiser, diga quando começou e quanto dura para ver quanto falta.
          </p>
          <FormularioCurso />
        </details>
        {podeCriar ? (
          <details id="nova-materia" className="scroll-mt-24 rounded-2xl border border-linha p-5">
            <summary className="cursor-pointer font-bold text-primaria">Nova matéria</summary>
            <p className="mt-2 mb-4 text-sm text-tinta-suave">
              A matéria guarda seus resumos e mapas mentais. Escolha em qual curso ela fica.
              {maxMaterias != null && ` Seu plano inclui ${maxMaterias} matérias.`}
            </p>
            <FormularioMateria cursos={cursos} />
          </details>
        ) : (
          <p className="text-sm text-tinta-suave">Você está usando as {maxMaterias} matérias do seu plano.</p>
        )}
      </div>

      {dasTurmas.length > 0 && (
        <section id="das-turmas" className="mt-10 scroll-mt-24" aria-labelledby="titulo-das-turmas">
          <h2 id="titulo-das-turmas" className="text-xl font-extrabold">
            Das turmas
          </h2>
          <p className="mt-1 text-sm text-tinta-suave">Resumos e mapas mentais que os professores compartilharam com você.</p>
          <ListaResumos resumos={dasTurmas} vazio="" />
        </section>
      )}
    </LayoutConta>
  );
}
