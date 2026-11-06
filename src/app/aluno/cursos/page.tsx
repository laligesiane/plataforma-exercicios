import { fmt } from "@/i18n/config";
import { obterDicionario } from "@/i18n/servidor";
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
  const d = await obterDicionario();
  const tx = d.cursos;
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
      titulo={tx.titulo}
      descricao={tx.descricao}
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
                nome={tx.semCurso}
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
          {tx.vazio}
        </p>
      )}

      <div className="mt-8 space-y-3">
        <details className="rounded-2xl border border-linha p-5" open={nada}>
          <summary className="cursor-pointer font-bold text-primaria">{tx.novoCurso}</summary>
          <p className="mt-2 mb-4 text-sm text-tinta-suave">
            {tx.novoCursoTexto}
          </p>
          <FormularioCurso />
        </details>
        {podeCriar ? (
          <details id="nova-materia" className="scroll-mt-24 rounded-2xl border border-linha p-5">
            <summary className="cursor-pointer font-bold text-primaria">{tx.novaMateria}</summary>
            <p className="mt-2 mb-4 text-sm text-tinta-suave">
              {tx.novaMateriaTexto}
              {maxMaterias != null && fmt(tx.planoInclui, { n: maxMaterias })}
            </p>
            <FormularioMateria cursos={cursos} />
          </details>
        ) : (
          <p className="text-sm text-tinta-suave">{fmt(tx.noLimite, { n: maxMaterias ?? 0 })}</p>
        )}
      </div>

      {dasTurmas.length > 0 && (
        <section id="das-turmas" className="mt-10 scroll-mt-24" aria-labelledby="titulo-das-turmas">
          <h2 id="titulo-das-turmas" className="text-xl font-extrabold">
            {tx.dasTurmas}
          </h2>
          <p className="mt-1 text-sm text-tinta-suave">{tx.dasTurmasTexto}</p>
          <ListaResumos resumos={dasTurmas} vazio="" />
        </section>
      )}
    </LayoutConta>
  );
}
