import { PainelLeitura } from "@/components/PreferenciasLeitura";
import { EscolherTema } from "@/components/Tema";
import type { Metadata } from "next";
import { sair } from "@/app/entrar/actions";
import { Cabecalho } from "@/components/Cabecalho";
import { EscolhaCookies } from "@/components/EscolhaCookies";
import { botaoSecundario } from "@/components/ui/estilos";
import { LIMITES_LIGADOS } from "@/lib/limites";
import { exigirLogin } from "@/lib/perfil";
import { loginGoogleLigado } from "@/lib/supabase/config";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { FormularioPagina, type PaginaSalva } from "./FormularioPagina";
import { AtivarMfa, BotaoDesligarMfa, FormularioNome, FormularioSenhaPerfil } from "./Formularios";

export const metadata: Metadata = { title: "Meu perfil · Repasa" };

type Plano = {
  nome: string;
  max_turmas: number | null;
  max_alunos_por_turma: number | null;
  max_atividades_por_turma?: number | null;
  max_materias?: number | null;
};

const nomesProvedor: Record<string, string> = { email: "E-mail", google: "Google" };

function data(valor?: string | null) {
  if (!valor) return "—";
  return new Date(valor).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Sao_Paulo" });
}

function dataHora(valor?: string | null) {
  if (!valor) return "—";
  return new Date(valor).toLocaleString("pt-BR", { dateStyle: "long", timeStyle: "short", timeZone: "America/Sao_Paulo" });
}

export default async function PaginaPerfil() {
  const perfil = await exigirLogin();
  const supabase = await criarClienteServidor();
  const professor = perfil.papel === "professor";

  const [{ data: usuario }, { data: plano }, { data: fatores }, { count: turmas }, { count: materias }, { data: pagina }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("plano").select("*").eq("id", perfil.plano_id).single<Plano>(),
    supabase.auth.mfa.listFactors(),
    professor
      ? supabase.from("turma").select("id", { count: "exact", head: true }).eq("professor_id", perfil.id)
      : supabase.from("turma_aluno").select("turma_id", { count: "exact", head: true }).eq("aluno_id", perfil.id),
    professor
      ? Promise.resolve({ count: null })
      : supabase.from("materia").select("id", { count: "exact", head: true }).eq("aluno_id", perfil.id),
    professor
      ? supabase.from("pagina_professor").select("apelido, nome, bio, materias, contato, publicada").eq("professor_id", perfil.id).maybeSingle<PaginaSalva>()
      : Promise.resolve({ data: null }),
  ]);
  const user = usuario.user;
  const provedores = [...new Set((user?.identities ?? []).map((i) => i.provider))];
  const fatorTotp = fatores?.totp[0];

  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-2xl space-y-6 px-4 pt-10 pb-16">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Meu perfil</h1>
          <p className="mt-1 text-tinta-suave">Seus dados, suas preferências e a segurança da conta.</p>
        </div>

        <Secao titulo="Seus dados">
          <FormularioNome nome={perfil.nome ?? ""} />
          <dl className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
            <Item rotulo="E-mail" valor={perfil.email} />
            <Item rotulo="Tipo de conta" valor={professor ? "Professor" : "Aluno"} />
            <Item rotulo="Na Repasa desde" valor={data(perfil.criado_em ?? user?.created_at)} />
            <Item rotulo="Último acesso" valor={dataHora(user?.last_sign_in_at)} />
          </dl>
        </Secao>

        <Secao titulo="Cor da sua Repasa">
          <EscolherTema inicial={perfil.tema} />
        </Secao>

        <Secao titulo="Leitura">
          <PainelLeitura />
        </Secao>

        {process.env.NEXT_PUBLIC_GA_ID && (
          <Secao titulo="Cookies e privacidade">
            <EscolhaCookies />
          </Secao>
        )}

        {LIMITES_LIGADOS && (
        <Secao titulo="Plano">
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            <Item rotulo="Plano atual" valor={plano?.nome ?? perfil.plano_id} />
            {professor ? (
              <>
                <Item rotulo="Turmas" valor={`${turmas ?? 0} de ${plano?.max_turmas ?? "—"}`} />
                <Item rotulo="Alunos por turma" valor={`até ${plano?.max_alunos_por_turma ?? "—"}`} />
                {plano?.max_atividades_por_turma != null && (
                  <Item rotulo="Atividades por turma" valor={`até ${plano.max_atividades_por_turma}`} />
                )}
              </>
            ) : (
              <>
                <Item rotulo="Minhas matérias" valor={`${materias ?? 0} de ${plano?.max_materias ?? 3}`} />
                <Item rotulo="Turmas em que estou" valor={String(turmas ?? 0)} />
              </>
            )}
          </dl>
        </Secao>
        )}

        {professor && (
          <Secao titulo="Sua página pública">
            <p className="mb-4 text-sm text-tinta-suave">
              Uma página para divulgar suas aulas, com quem você é, o que ensina, como falar com você e suas atividades públicas.
            </p>
            <FormularioPagina pagina={pagina} nomePadrao={perfil.nome ?? ""} />
          </Secao>
        )}

        <Secao titulo="Como você entra">
          <p className="text-sm text-tinta-suave">
            Contas ligadas: <strong className="text-tinta">{provedores.map((p) => nomesProvedor[p] ?? p).join(" e ") || "E-mail"}</strong>.
            Você sempre pode entrar com um código enviado para {perfil.email}, sem senha.
            {loginGoogleLigado && !provedores.includes("google") && " Para usar o Google, clique em “Continuar com Google” na tela de entrar com este mesmo e-mail."}
          </p>
          <h3 className="mt-5 mb-1 font-bold">Senha</h3>
          <p className="mb-3 text-sm text-tinta-suave">
            Crie ou troque sua senha. Se você entra pelo Google ou por código, ela é opcional.
          </p>
          <FormularioSenhaPerfil />
        </Secao>

        <Secao titulo="Verificação em duas etapas">
          {fatorTotp?.status === "verified" ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm">
                <span className="mr-2 rounded-full bg-certo-fundo px-2.5 py-0.5 text-xs font-bold text-certo">Ligada</span>
                Desde {data(fatorTotp.created_at)}. Ao entrar, a Repasa pede o código do app autenticador.
              </p>
              <BotaoDesligarMfa fatorId={fatorTotp.id} />
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-tinta-suave">
                Além da senha (ou do código por e-mail, ou do Google), a Repasa pede um código que muda a cada 30 segundos num app do
                seu celular. Mesmo que alguém descubra sua senha, não consegue entrar.
              </p>
              <AtivarMfa />
            </>
          )}
        </Secao>

        <form action={sair}>
          <button className={botaoSecundario}>Sair da conta</button>
        </form>
      </main>
    </>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-linha bg-fundo p-5 sm:p-6">
      <h2 className="mb-4 text-xl font-extrabold tracking-tight">{titulo}</h2>
      {children}
    </section>
  );
}

function Item({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <dt className="text-xs font-bold tracking-wide text-tinta-suave uppercase">{rotulo}</dt>
      <dd className="mt-0.5 break-words">{valor}</dd>
    </div>
  );
}
