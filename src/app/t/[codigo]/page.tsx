import type { Metadata } from "next";
import Link from "next/link";
import { Cabecalho } from "@/components/Cabecalho";
import { Mascote } from "@/components/Mascote";
import { botaoPrimario } from "@/components/ui/estilos";
import { formatarCodigo, normalizarCodigo } from "@/lib/codigoTurma";
import { obterPerfil } from "@/lib/perfil";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { entrarComCodigo } from "./actions";

export const metadata: Metadata = { title: "Entrar na turma · Repasa" };

const erros: Record<string, string> = {
  cheia: "A turma chegou ao limite de alunos do plano do professor. Avise o professor.",
  invalido: "Não deu para entrar com esse código. Confira com o professor.",
};

export default async function EntrarNaTurma({
  params,
  searchParams,
}: {
  params: Promise<{ codigo: string }>;
  searchParams: Promise<{ erro?: string }>;
}) {
  const [{ codigo: bruto }, { erro }] = await Promise.all([params, searchParams]);
  const codigo = normalizarCodigo(decodeURIComponent(bruto));
  const supabase = await criarClienteServidor();
  const [perfil, { data }] = await Promise.all([
    obterPerfil(),
    codigo ? supabase.rpc("turma_pelo_codigo", { p_codigo: codigo }) : Promise.resolve({ data: null }),
  ]);
  const turma = (data as { turma_id: string; nome: string; professor: string }[] | null)?.[0] ?? null;
  const aqui = `/t/${codigo ?? ""}`;

  return (
    <>
      <Cabecalho />
      <main className="mx-auto flex w-full max-w-md flex-col items-center px-4 pt-12 pb-16 text-center">
        <Mascote tamanho={96} animado />
        {!turma ? (
          <>
            <h1 className="mt-4 text-2xl font-extrabold">Código não encontrado</h1>
            <p className="mt-2 text-tinta-suave">Confira as letras com o professor. O código tem 6 letras e números.</p>
          </>
        ) : (
          <>
            <p className="mt-4 text-sm font-bold text-primaria">Convite para a turma</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{turma.nome}</h1>
            {turma.professor && <p className="mt-1 text-tinta-suave">com {turma.professor}</p>}
            <p className="mt-2 font-mono text-sm tracking-widest text-tinta-suave">{formatarCodigo(codigo!)}</p>

            {erro && erros[erro] && (
              <p role="alert" className="mt-5 rounded-xl bg-erro-fundo px-3.5 py-2.5 text-sm text-erro">
                {erros[erro]}
              </p>
            )}

            {perfil?.papel === "aluno" ? (
              <form action={entrarComCodigo} className="mt-6">
                <input type="hidden" name="codigo" value={codigo!} />
                <button type="submit" className={botaoPrimario}>
                  Entrar na turma
                </button>
              </form>
            ) : perfil ? (
              <p className="mt-6 text-sm text-tinta-suave">Você entrou com uma conta de professor. Para entrar na turma, use uma conta de aluno.</p>
            ) : (
              <div className="mt-6 flex flex-col items-center gap-3">
                <Link href={`/entrar?proximo=${aqui}`} className={botaoPrimario}>
                  Já tenho conta: entrar
                </Link>
                <Link href="/cadastro?papel=aluno" className="text-sm font-bold text-primaria hover:underline">
                  Criar conta de aluno grátis
                </Link>
                <p className="text-xs text-tinta-suave">Depois de criar a conta, abra este link de novo ou digite o código em Minha conta.</p>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
