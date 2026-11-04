import Link from "next/link";
import { Cabecalho } from "@/components/Cabecalho";
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

const passos = [
  {
    numero: "1",
    titulo: "Você responde",
    texto: "Cada item é corrigido na hora, um por um. Nada de esperar o fim da lista para saber como foi.",
  },
  {
    numero: "2",
    titulo: "Errou? Entende o porquê",
    texto: "A explicação do erro aparece logo abaixo da resposta, escrita pelo professor, como se ele estivesse do lado.",
  },
  {
    numero: "3",
    titulo: "E repassa",
    texto: "Tenta de novo com a explicação fresca na cabeça. É assim que o conteúdo deixa de ser decorado e vira seu.",
  },
];

const promessas = [
  { titulo: "Sem anúncios. Nunca.", texto: "Lugar de estudo não é vitrine. Ninguém vai interromper sua atividade para vender nada." },
  { titulo: "Sempre um plano grátis", texto: "Dá para começar e usar de verdade sem pagar. Os planos pagos existem para quem precisa de mais." },
  { titulo: "O erro é parte da aula", texto: "Errar aqui não tira ponto. É o momento em que a explicação chega e o aprendizado acontece." },
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
            <p className="text-sm font-bold tracking-wide text-primaria uppercase">Do espanhol, repasar</p>
            <h1 className="mt-3 text-4xl leading-[1.08] font-extrabold tracking-tight text-balance sm:text-5xl">
              Voltar ao que se aprendeu até ficar firme.
            </h1>
            <p className="mt-5 max-w-prose text-lg text-tinta-suave">
              A Repasa é um lugar para estudar com o seu professor. Você faz a atividade, vê na hora se acertou e, quando
              erra, entende o porquê.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {perfil ? (
                <Link href={paginaInicial(perfil.papel)} className={botaoPrimario}>
                  {perfil.papel === "professor" ? "Ir para minhas turmas" : "Ir para minhas atividades"}
                </Link>
              ) : (
                <>
                  <Link href="/experimente" className={botaoPrimario}>
                    Experimentar uma atividade
                  </Link>
                  <Link href="/cadastro" className={botaoContorno}>
                    Sou professor
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Exemplo de correção (ilustrativo) */}
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
              <p className="mt-2 text-sm font-bold text-certo">Isso! Agora ficou.</p>
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
                é passar adiante. O professor repassa o que sabe; o aluno repassa a matéria até ela ser dele.
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

        {/* A história */}
        <section className="mx-auto w-full max-w-3xl px-4 py-16">
          <h2 className="text-3xl font-extrabold tracking-tight">Como tudo começou</h2>
          <div className="mt-5 space-y-4 text-lg text-tinta-suave">
            <p>
              A Repasa nasceu na sala de aula de uma professora de espanhol e inglês, por causa de uma pergunta que os
              alunos faziam toda semana: <strong className="text-tinta">“mas por que eu errei?”</strong>
            </p>
            <p>
              Os sites de exercício davam a nota e paravam ali. Sete de dez, tente de novo. Ninguém dizia o que tinha
              faltado. Ela queria que cada erro viesse acompanhado da explicação, na hora, do jeito que ela faria se
              estivesse sentada ao lado do aluno.
            </p>
            <p>
              Foi isso que construímos: um lugar onde errar não é o fim do exercício, é o começo da explicação. E onde
              voltar ao conteúdo, <em>repasar</em>, é o caminho natural, e não um castigo.
            </p>
          </div>
        </section>

        {/* Como funciona */}
        <section className="border-t border-linha">
          <div className="mx-auto w-full max-w-5xl px-4 py-16">
            <h2 className="text-3xl font-extrabold tracking-tight">Como funciona</h2>
            <ol className="mt-8 grid gap-4 md:grid-cols-3">
              {passos.map((p) => (
                <li key={p.numero} className="rounded-3xl border border-linha p-6">
                  <span className="flex size-10 items-center justify-center rounded-[12px] bg-primaria text-lg font-extrabold text-white">
                    {p.numero}
                  </span>
                  <h3 className="mt-4 text-lg font-extrabold">{p.titulo}</h3>
                  <p className="mt-2 text-tinta-suave">{p.texto}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Para quem */}
        <section className="bg-suave">
          <div className="mx-auto grid w-full max-w-5xl gap-4 px-4 py-16 md:grid-cols-2">
            <div className="rounded-3xl border border-linha bg-fundo p-6">
              <h2 className="text-2xl font-extrabold tracking-tight">Para professores</h2>
              <ul className="mt-4 space-y-2 text-tinta-suave">
                <li>Crie turmas e convide seus alunos por e-mail.</li>
                <li>Monte atividades de lacuna, múltipla escolha, arrastar, classificar e relacionar.</li>
                <li>Escreva a explicação de cada erro uma vez e ela chega a todos os alunos.</li>
                <li>Veja o que cada aluno respondeu.</li>
              </ul>
              <Link href="/cadastro" className={`${botaoPrimario} mt-6 inline-block`}>
                Criar conta de professor
              </Link>
            </div>
            <div className="rounded-3xl border border-linha bg-fundo p-6">
              <h2 className="text-2xl font-extrabold tracking-tight">Para alunos</h2>
              <ul className="mt-4 space-y-2 text-tinta-suave">
                <li>Faça as atividades do seu professor, no computador ou no celular.</li>
                <li>Saiba na hora se acertou e, se errou, o porquê.</li>
                <li>Volte quando quiser para repassar.</li>
              </ul>
              <p className="mt-4 rounded-xl bg-primaria-suave px-4 py-3 text-sm text-tinta">
                <strong>Em breve:</strong> estudar por conta própria, com suas matérias, resumos e mapas mentais.
              </p>
              <Link href="/experimente" className={`${botaoContorno} mt-6 inline-block`}>
                Experimentar uma atividade
              </Link>
            </div>
          </div>
        </section>

        {/* Promessas */}
        <section className="mx-auto w-full max-w-5xl px-4 py-16">
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
            <p className="mx-auto mt-3 max-w-md opacity-80">Uma atividade leva poucos minutos. Experimente errar de propósito.</p>
            <Link
              href="/experimente"
              className="mt-6 inline-block rounded-full bg-primaria px-6 py-2.5 font-bold text-white transition-opacity hover:opacity-90"
            >
              Experimentar agora
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
