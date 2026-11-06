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
      voltar={{ href: "/aluno/cursos", rotulo: "Meus cursos" }}
      titulo={curso ? curso.nome : "Sem curso"}
      descricao={
        curso
          ? "As matérias deste curso. Toque numa matéria para ver os resumos e mapas mentais."
          : "Matérias que ainda não estão em nenhum curso. Escolha um curso embaixo de cada uma."
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
          Nenhuma matéria aqui ainda.
          {curso && " Crie uma abaixo ou mude o curso de uma matéria que você já tem."}
        </p>
      )}

      {curso && podeCriar && (
        <details className="mt-8 rounded-2xl border border-linha p-5" open={materias.length === 0}>
          <summary className="cursor-pointer font-bold text-primaria">
            <span className="inline-flex items-center gap-1.5">
              <Icone nome="mais" className="size-4" />
              Nova matéria em {curso.nome}
            </span>
          </summary>
          <div className="mt-4">
            <FormularioMateria cursos={cursos} cursoInicial={curso.id} />
          </div>
        </details>
      )}

      {curso && (
        <details className="mt-4 text-sm">
          <summary className="cursor-pointer text-tinta-suave hover:text-tinta">Editar ou excluir curso</summary>
          <FormularioEditarCurso curso={curso} />
          <BotaoExcluir
            acao={apagarCurso}
            campos={{ id: curso.id }}
            rotulo="Excluir curso"
            pergunta={`Excluir o curso "${curso.nome}"? As matérias e os resumos dele continuam, só ficam em "Sem curso".`}
            discreto
            className="mt-3"
          />
        </details>
      )}
    </LayoutConta>
  );
}
