import Link from "next/link";
import { Cabecalho } from "@/components/Cabecalho";
import { Mascote } from "@/components/Mascote";
import { botaoPrimario } from "@/components/ui/estilos";
import { obterPerfil, paginaInicial } from "@/lib/perfil";

const botaoContorno =
  "rounded-full border-2 border-linha px-6 py-2 font-bold text-tinta transition-colors hover:border-tinta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria";

const acepcoes = [
  {
    texto: "Voltar a estudar o que já se aprendeu, para que fique firme.",
    exemplo: "Repasa los verbos antes del examen.",
  },
  {
    texto: "Passar de novo por um mesmo caminho.",
    exemplo: "Repasamos la calle hasta encontrar la casa.",
  },
  {
    texto: "Examinar com calma um trabalho já feito, procurando o que corrigir.",
    exemplo: "Repasa tus respuestas antes de entregar.",
  },
];

const recursos = [
  {
    icone: "📚",
    titulo: "Suas matérias, organizadas",
    texto: "Português, espanhol, história, o que for. Cada matéria guarda os seus resumos, mapas e atividades num lugar só.",
  },
  {
    icone: "✍️",
    titulo: "Resumos do seu jeito",
    texto: "Escreva com títulos, negrito, marca-texto, listas e notas. O sumário fica do lado, e dá para exportar em PDF.",
  },
  {
    icone: "🧠",
    titulo: "Mapas mentais",
    texto: "Gere um mapa mental a partir do seu resumo, com um clique, e veja o assunto de cima. Ótimo para a véspera da prova.",
  },
  {
    icone: "✅",
    titulo: "Exercícios que explicam o erro",
    texto: "Cada resposta é corrigida na hora. Errou? A explicação aparece logo abaixo, e você tenta de novo.",
  },
];

const promessas = [
  { titulo: "Sem anúncios. Nunca.", texto: "Lugar de estudo não é vitrine. Ninguém vai interromper sua atividade para vender nada." },
  { titulo: "Sempre um plano grátis", texto: "Dá para começar e usar de verdade sem pagar. Os planos pagos existem para quem precisa de mais." },
  { titulo: "Seus estudos são seus", texto: "Seus resumos e mapas ficam guardados com você, organizados por matéria, para voltar sempre que precisar." },
];

export default async function Inicio() {
  const perfil = await obterPerfil();

  return (
    <div className="flex min-h-screen flex-col">
      <Cabecalho />

      <main className="flex-1">
        {/* Abertura */}
        <section className="mx-auto grid w-full max-w-5xl items-center gap-10 px-4 pt-12 pb-16 md:grid-cols-[1.1fr_1fr] md:pt-20">
          <div>
            <p className="text-sm font-bold tracking-wide text-primaria uppercase">Repasa, do espanhol repasar</p>
            <h1 className="mt-3 text-4xl leading-[1.08] font-extrabold tracking-tight text-balance sm:text-5xl">
              Seu melhor amigo na hora de aprender.
            </h1>
            <p className="mt-5 max-w-prose text-lg text-tinta-suave">
              Organize suas matérias, escreva resumos, monte mapas mentais e pratique com exercícios que explicam cada
              erro. Sozinho ou com o seu professor.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {perfil ? (
                <Link href={paginaInicial(perfil.papel)} className={botaoPrimario}>
                  {perfil.papel === "professor" ? "Ir para minhas turmas" : "Ir para meus estudos"}
                </Link>
              ) : (
                <>
                  <Link href="/cadastro?papel=aluno" className={botaoPrimario}>
                    Começar a estudar
                  </Link>
                  <Link href="/entrar" className={botaoContorno}>
                    Entrar
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mesa de estudo (ilustrativa). O espaço do mascote fica no canto, marcado com data-mascote. */}
          <div className="relative rounded-3xl border border-linha bg-suave p-5 sm:p-6" aria-hidden="true">
            <div className="flex flex-wrap gap-1.5">
              {["Português", "Espanhol", "História"].map((m, i) => (
                <span
                  key={m}
                  className={`rounded-full px-3 py-1 text-xs font-bold ${i === 1 ? "bg-primaria text-white" : "bg-fundo text-tinta-suave"}`}
                >
                  {m}
                </span>
              ))}
            </div>
            <div className="mt-4 rounded-2xl border border-linha bg-fundo p-4">
              <p className="text-xs font-bold tracking-wide text-tinta-suave uppercase">Resumo</p>
              <p className="mt-1 text-lg font-extrabold">Pretérito imperfeito</p>
              <p className="mt-2 text-sm text-tinta-suave">
                Usado para <mark className="rounded bg-aviso-fundo px-1 text-tinta">hábitos no passado</mark> e para
                descrever cenas.
              </p>
              <ul className="mt-2 list-disc pl-5 text-sm text-tinta-suave">
                <li>-ar → -aba: repasaba</li>
                <li>-er/-ir → -ía: comía, vivía</li>
              </ul>
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-2xl border border-linha bg-fundo p-4 text-sm font-bold">
              <span className="rounded-full bg-primaria-suave px-3 py-1 text-primaria">Imperfeito</span>
              <span className="h-0.5 w-5 bg-linha" />
              <span className="rounded-full border border-linha px-3 py-1">Hábitos</span>
              <span className="h-0.5 w-5 bg-linha" />
              <span className="rounded-full border border-linha px-3 py-1">Descrições</span>
            </div>
            <div
              data-mascote
              className="absolute -right-3 -bottom-5 flex items-center gap-2 sm:-right-5"
            >
              <span className="rounded-2xl rounded-br-sm border border-linha bg-fundo px-3 py-1.5 text-sm font-bold shadow-sm">
                Bora repassar?
              </span>
              <Mascote pose="feliz" tamanho={72} />
            </div>
          </div>
        </section>

        {/* Recursos */}
        <section className="border-y border-linha bg-suave">
          <div className="mx-auto w-full max-w-5xl px-4 py-16">
            <h2 className="text-3xl font-extrabold tracking-tight">Tudo o que ajuda você a aprender</h2>
            <p className="mt-3 max-w-prose text-tinta-suave">
              A Repasa junta num lugar só o que normalmente fica espalhado entre caderno, aplicativo de notas e folha de
              exercício.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {recursos.map((r) => (
                <div key={r.titulo} className="rounded-3xl border border-linha bg-fundo p-6">
                  <span className="flex size-11 items-center justify-center rounded-[12px] bg-primaria-suave text-xl">
                    {r.icone}
                  </span>
                  <h3 className="mt-4 text-lg font-extrabold">{r.titulo}</h3>
                  <p className="mt-2 text-tinta-suave">{r.texto}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Exemplo de correção */}
        <section className="mx-auto grid w-full max-w-5xl items-center gap-10 px-4 py-16 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Errou? A Repasa explica.</h2>
            <p className="mt-4 text-tinta-suave">
              Nada de “sete de dez, tente de novo”. Cada item é corrigido na hora e, quando a resposta não está certa, a
              explicação aparece logo abaixo, como se alguém estivesse estudando do seu lado.
            </p>
            <Link href="/experimente" className={`${botaoContorno} mt-6 inline-block`}>
              Experimentar uma atividade
            </Link>
          </div>
          <figure className="rounded-3xl border border-linha bg-suave p-5 sm:p-6">
            <figcaption className="text-xs font-bold tracking-wide text-tinta-suave uppercase">Como é a correção</figcaption>
            <div className="mt-3 rounded-2xl border border-linha bg-fundo p-4">
              <p className="font-semibold">
                Antes del examen, yo siempre{" "}
                <span className="rounded-lg border-2 border-erro bg-erro-fundo px-2 py-0.5 text-erro line-through">
                  repasso
                </span>{" "}
                mis apuntes.
              </p>
              <div className="mt-3 rounded-xl bg-erro-fundo p-3 text-sm">
                <p className="font-bold text-erro">Quase! A resposta é “repaso”.</p>
                <p className="mt-1 text-tinta">
                  Em espanhol não existe “ss”. O som é o mesmo, mas a grafia leva um “s” só.
                </p>
              </div>
            </div>
            <div className="mt-3 rounded-2xl border border-linha bg-fundo p-4">
              <p className="font-semibold">
                Antes del examen, yo siempre{" "}
                <span className="rounded-lg border-2 border-certo bg-certo-fundo px-2 py-0.5 text-certo">repaso</span> mis
                apuntes.
              </p>
              <p className="mt-2 text-sm font-bold text-certo">Isso! Agora está certo.</p>
            </div>
          </figure>
        </section>

        {/* A palavra */}
        <section className="border-y border-linha bg-suave">
          <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-16 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight">De onde vem o nome</h2>
              <p className="mt-4 text-tinta-suave">
                Em espanhol, <em>repasar</em> é o que se faz na véspera da prova: abrir o caderno de novo, rever o que já
                foi visto, passar outra vez pelo mesmo caminho até ele ficar conhecido. E <em>¡repasa!</em> é o que todo
                professor diz no fim da aula.
              </p>
              <p className="mt-4 text-tinta-suave">
                Em português, a palavra é quase a mesma e ganha mais um sentido: <strong className="text-tinta">repassar</strong>{" "}
                é passar adiante. A Repasa está aqui para isso: estudar junto com você até a matéria ser sua.
              </p>
            </div>

            <div className="rounded-3xl border border-linha bg-fundo p-6">
              <p className="text-3xl font-extrabold tracking-tight">
                re·pa·sar
                <span className="ml-3 align-middle text-sm font-semibold text-tinta-suave">verbo · espanhol</span>
              </p>
              <ol className="mt-5 space-y-4">
                {acepcoes.map((a, i) => (
                  <li key={a.exemplo} className="flex gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primaria-suave text-sm font-extrabold text-primaria">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-semibold">{a.texto}</p>
                      <p className="mt-0.5 text-sm text-tinta-suave italic" lang="es">
                        {a.exemplo}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Para quem */}
        <section>
          <div className="mx-auto grid w-full max-w-5xl gap-4 px-4 py-16 md:grid-cols-2">
            <div className="rounded-3xl border border-linha p-6">
              <h2 className="text-2xl font-extrabold tracking-tight">Para quem estuda</h2>
              <ul className="mt-4 space-y-2 text-tinta-suave">
                <li>Crie suas matérias e estude por conta própria, sem precisar de professor.</li>
                <li>Escreva resumos e monte mapas mentais para revisar.</li>
                <li>Se um professor te convidar, as turmas e atividades dele aparecem junto.</li>
                <li>Veja os horários das suas aulas na sua agenda.</li>
              </ul>
              <Link href="/cadastro?papel=aluno" className={`${botaoPrimario} mt-6 inline-block`}>
                Criar conta de aluno
              </Link>
            </div>
            <div className="rounded-3xl border border-linha p-6">
              <h2 className="text-2xl font-extrabold tracking-tight">Para quem ensina</h2>
              <ul className="mt-4 space-y-2 text-tinta-suave">
                <li>Crie turmas de qualquer matéria e convide seus alunos por e-mail.</li>
                <li>Registre as aulas e compartilhe resumos com a turma.</li>
                <li>Monte exercícios e escreva a explicação de cada erro uma vez só.</li>
                <li>Veja o que cada aluno respondeu.</li>
              </ul>
              <Link href="/cadastro" className={`${botaoContorno} mt-6 inline-block`}>
                Criar conta de professor
              </Link>
            </div>
          </div>
        </section>

        {/* Promessas */}
        <section className="mx-auto w-full max-w-5xl px-4 pb-16">
          <h2 className="text-3xl font-extrabold tracking-tight">O que a gente promete</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {promessas.map((p) => (
              <div key={p.titulo} className="border-l-4 border-primaria pl-4">
                <h3 className="text-lg font-extrabold">{p.titulo}</h3>
                <p className="mt-2 text-tinta-suave">{p.texto}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Fecho */}
        <section className="px-4 pb-20">
          <div className="mx-auto max-w-5xl rounded-3xl bg-tinta px-6 py-12 text-center text-fundo">
            <p className="text-4xl font-extrabold tracking-tight" lang="es">
              ¡Repasa!
            </p>
            <p className="mx-auto mt-3 max-w-md opacity-80">
              Crie sua conta, abra sua primeira matéria e comece a estudar. É grátis.
            </p>
            <Link
              href={perfil ? paginaInicial(perfil.papel) : "/cadastro?papel=aluno"}
              className="mt-6 inline-block rounded-full bg-primaria px-6 py-2.5 font-bold text-white transition-opacity hover:opacity-90"
            >
              {perfil ? "Ir para meus estudos" : "Começar a estudar"}
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-linha py-6 text-center text-xs text-tinta-suave">
        Repasa · repasa.com.br · Sem anúncios, nunca.
      </footer>
    </div>
  );
}
