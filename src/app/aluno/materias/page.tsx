import Link from "next/link";
import { BotaoExcluir } from "@/components/BotaoExcluir";
import { Icone } from "@/components/jogos/Icones";
import { chegouAoLimite, limite } from "@/lib/limites";
import { exigirPapel } from "@/lib/perfil";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { CartaoMateria } from "../CartaoMateria";
import { LayoutConta } from "../LayoutConta";
import { apagarCurso } from "./actions";
import { FormularioCurso, FormularioRenomearCurso } from "./FormularioCurso";
import { FormularioMateria } from "./FormularioMateria";
import { SeletorCurso, type CursoSimples } from "./SeletorCurso";

type MateriaLista = { id: string; nome: string; cor: string; curso_id: string | null; resumo: unknown };

export default async function MateriasDoAluno({ searchParams }: { searchParams: Promise<{ curso?: string }> }) {
  const perfil = await exigirPapel("aluno");
  const { curso: cursoPedido } = await searchParams;
  const supabase = await criarClienteServidor();
  const [{ data }, { data: cursosDb }, { data: plano }] = await Promise.all([
    supabase.from("materia").select("id, nome, cor, curso_id, resumo(count)").order("criada_em"),
    supabase.from("curso").select("id, nome").order("nome"),
    supabase.from("plano").select("max_materias").eq("id", perfil.plano_id).single(),
  ]);
  const materias = (data ?? []) as MateriaLista[];
  const cursos = (cursosDb ?? []) as CursoSimples[];
  const maxMaterias = limite(plano?.max_materias);
  const idsCursos = new Set(cursos.map((c) => c.id));
  const semCurso = materias.filter((m) => !m.curso_id || !idsCursos.has(m.curso_id));
  const cursoInicial = cursoPedido && idsCursos.has(cursoPedido) ? cursoPedido : "";
  const podeCriar = !chegouAoLimite(materias.length, plano?.max_materias);

  const grade = (lista: MateriaLista[]) => (
    <ul className="mt-3 grid gap-3 sm:grid-cols-3">
      {lista.map((m) => (
        <li key={m.id}>
          <CartaoMateria
            id={m.id}
            nome={m.nome}
            cor={m.cor}
            total={(m.resumo as { count: number }[] | null)?.[0]?.count ?? 0}
          />
          {cursos.length > 0 && <SeletorCurso materiaId={m.id} cursoId={m.curso_id} cursos={cursos} compacto />}
        </li>
      ))}
    </ul>
  );

  return (
    <LayoutConta
      titulo="Minhas matérias"
      descricao="Organize suas matérias em cursos (ex.: Espanhol, Faculdade) e guarde nelas seus resumos e mapas mentais. Só você vê."
    >
      {cursos.map((c) => {
        const doCurso = materias.filter((m) => m.curso_id === c.id);
        return (
          <section key={c.id} className="mt-8" aria-labelledby={`curso-${c.id}`}>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <Icone nome="pasta" className="size-5 text-primaria" />
              <h2 id={`curso-${c.id}`} className="text-xl font-extrabold">
                {c.nome}
              </h2>
              <span className="text-sm text-tinta-suave">
                {doCurso.length} {doCurso.length === 1 ? "matéria" : "matérias"}
              </span>
              {podeCriar && (
                <Link
                  href={`/aluno/materias?curso=${c.id}#nova-materia`}
                  className="ml-auto inline-flex items-center gap-1 text-sm font-bold text-primaria hover:underline"
                >
                  <Icone nome="mais" className="size-4" />
                  Nova matéria aqui
                </Link>
              )}
            </div>
            {doCurso.length > 0 ? (
              grade(doCurso)
            ) : (
              <p className="mt-3 rounded-2xl border border-dashed border-linha p-4 text-sm text-tinta-suave">
                Nenhuma matéria neste curso ainda. Crie uma nova ou mude o curso de uma matéria que você já tem.
              </p>
            )}
            <details className="mt-2 text-sm">
              <summary className="cursor-pointer text-tinta-suave hover:text-tinta">Renomear ou excluir curso</summary>
              <FormularioRenomearCurso id={c.id} nome={c.nome} />
              <BotaoExcluir
                acao={apagarCurso}
                campos={{ id: c.id }}
                rotulo="Excluir curso"
                pergunta={`Excluir o curso "${c.nome}"? As matérias e os resumos dele continuam, só ficam sem curso.`}
                discreto
                className="mt-3"
              />
            </details>
          </section>
        );
      })}

      {semCurso.length > 0 && (
        <section className="mt-8">
          {cursos.length > 0 && <h2 className="text-xl font-extrabold">Sem curso</h2>}
          {grade(semCurso)}
        </section>
      )}

      <div className="mt-8 space-y-3">
        {podeCriar ? (
          <details
            id="nova-materia"
            className="scroll-mt-24 rounded-2xl border border-linha p-5"
            open={materias.length === 0 || !!cursoInicial}
          >
            <summary className="cursor-pointer font-bold text-primaria">Nova matéria</summary>
            <p className="mt-2 mb-4 text-sm text-tinta-suave">
              Crie matérias para guardar seus resumos e mapas mentais.
              {maxMaterias != null && ` Seu plano inclui ${maxMaterias}.`}
            </p>
            <FormularioMateria key={cursoInicial} cursos={cursos} cursoInicial={cursoInicial} />
          </details>
        ) : (
          <p className="text-sm text-tinta-suave">Você está usando as {maxMaterias} matérias do seu plano.</p>
        )}
        <details className="rounded-2xl border border-linha p-5">
          <summary className="cursor-pointer font-bold text-primaria">Novo curso</summary>
          <p className="mt-2 mb-4 text-sm text-tinta-suave">
            Um curso junta várias matérias. Por exemplo: o curso “Faculdade” com as matérias Cálculo e Física, ou
            “Espanhol” com Gramática e Vocabulário.
          </p>
          <FormularioCurso />
        </details>
      </div>
    </LayoutConta>
  );
}
