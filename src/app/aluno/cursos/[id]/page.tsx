import { fmt } from "@/i18n/config";
import { obterDicionario } from "@/i18n/servidor";
import { notFound } from "next/navigation";
import { BotaoExcluir } from "@/components/BotaoExcluir";
import { Icone } from "@/components/jogos/Icones";
import { chegouAoLimite } from "@/lib/limites";
import { exigirPapel } from "@/lib/perfil";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { CartaoMateria } from "../../CartaoMateria";
import { LayoutConta } from "../../LayoutConta";
import { apagarCurso } from "../../materias/actions";
import { FormularioEditarCurso } from "../../materias/FormularioCurso";
import { FormularioMateria } from "../../materias/FormularioMateria";
import { ProgressoCurso } from "../../materias/ProgressoCurso";
import { SeletorCurso } from "../../materias/SeletorCurso";
import { carregarCursos, SEM_CURSO } from "../dados";

export default async function PaginaCurso({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const perfil = await exigirPapel("aluno");
  const supabase = await criarClienteServidor();
  const d = await obterDicionario();
  const tx = d.cursos;
  const [{ cursos, semCurso, totalMaterias }, { data: plano }] = await Promise.all([
    carregarCursos(),
    supabase.from("plano").select("max_materias").eq("id", perfil.plano_id).single(),
  ]);
  const ehSemCurso = id === SEM_CURSO;
  const curso = ehSemCurso ? null : cursos.find((c) => c.id === id);
  if (!ehSemCurso && !curso) notFound();
  const materias = curso ? curso.materias : semCurso;
  const podeCriar = !chegouAoLimite(totalMaterias, plano?.max_materias);

  return (
    <LayoutConta
      voltar={{ href: "/aluno/cursos", rotulo: tx.titulo }}
      titulo={curso ? curso.nome : tx.semCurso}
      descricao={
        curso
          ? tx.descricaoCurso
          : tx.descricaoSemCurso
      }
    >
      {curso && <ProgressoCurso curso={curso} />}

      {materias.length > 0 ? (
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {materias.map((m) => (
            <li key={m.id} className="flex flex-col">
              <div className="grow">
                <CartaoMateria id={m.id} nome={m.nome} cor={m.cor} total={m.resumos} />
              </div>
              {cursos.length > 0 && <SeletorCurso materiaId={m.id} cursoId={m.curso_id} cursos={cursos} compacto />}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 rounded-3xl border border-dashed border-linha p-5 text-sm text-tinta-suave">
          {tx.nenhumaMateria}
          {curso && tx.nenhumaMateriaCurso}
        </p>
      )}

      {curso && podeCriar && (
        <details className="mt-8 rounded-2xl border border-linha p-5" open={materias.length === 0}>
          <summary className="cursor-pointer font-bold text-primaria">
            <span className="inline-flex items-center gap-1.5">
              <Icone nome="mais" className="size-4" />
              {fmt(tx.novaMateriaEm, { curso: curso.nome })}
            </span>
          </summary>
          <div className="mt-4">
            <FormularioMateria cursos={cursos} cursoInicial={curso.id} />
          </div>
        </details>
      )}

      {curso && (
        <details className="mt-4 text-sm">
          <summary className="cursor-pointer text-tinta-suave hover:text-tinta">{tx.editarExcluir}</summary>
          <FormularioEditarCurso curso={curso} />
          <BotaoExcluir
            acao={apagarCurso}
            campos={{ id: curso.id }}
            rotulo={tx.excluirCurso}
            pergunta={fmt(tx.perguntaExcluir, { curso: curso.nome })}
            discreto
            className="mt-3"
          />
        </details>
      )}
    </LayoutConta>
  );
}
