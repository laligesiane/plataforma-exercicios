import type { Metadata } from "next";
import Link from "next/link";
import { Cabecalho } from "@/components/Cabecalho";
import { IconeLogo, Mascote } from "@/components/Mascote";
import { AnimacoesLanding } from "@/components/landing/AnimacoesLanding";
import type { CSSProperties } from "react";
import { botaoPrimario } from "@/components/ui/estilos";
import { obterPerfil, paginaInicial } from "@/lib/perfil";
import { dadosEstruturadosInicio } from "@/lib/seo/site";

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
    icone: (
      <>
        <path d="M2 4.5h6a4 4 0 0 1 4 4V20a3 3 0 0 0-3-3H2z" />
        <path d="M22 4.5h-6a4 4 0 0 0-4 4V20a3 3 0 0 1 3-3h7z" />
      </>
    ),
    titulo: "Suas matérias, organizadas",
    texto: "Português, espanhol, história, o que for. Cada matéria guarda os seus resumos, mapas e atividades num lugar só.",
  },
  {
    icone: (
      <>
        <path d="M12 20h9" />
        <path d="M16.4 3.6a2.1 2.1 0 0 1 3 3L7.5 18.5 3.5 19.5l1-4z" />
      </>
    ),
    titulo: "Resumos do seu jeito",
    texto: "Escreva com títulos, negrito, marca-texto, listas e notas. O sumário fica do lado, e dá para exportar em PDF.",
  },
  {
    icone: (
      <>
        <circle cx="12" cy="12" r="3" />
        <circle cx="4.5" cy="5" r="2" />
        <circle cx="19.5" cy="5" r="2" />
        <circle cx="4.5" cy="19" r="2" />
        <circle cx="19.5" cy="19" r="2" />
        <path d="M6 6.4 9.8 10M18 6.4 14.2 10M6 17.6l3.8-3.6M18 17.6l-3.8-3.6" />
      </>
    ),
    titulo: "Mapas mentais",
    texto: "Gere um mapa mental a partir do seu resumo, com um clique, e veja o assunto de cima. Ótimo para a véspera da prova.",
  },
  {
    icone: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12.5 2.8 2.8L16.5 9.5" />
      </>
    ),
    titulo: "Exercícios que explicam o erro",
    texto: "Cada resposta é corrigida na hora. Errou? A explicação aparece logo abaixo, e você tenta de novo.",
  },
];

const promessas = [
  { titulo: "Sem anúncios. Nunca.", texto: "Lugar de estudo não é vitrine. Ninguém vai interromper sua atividade para vender nada." },
  { titulo: "Grátis e sem limites", texto: "Crie quantas turmas, atividades e matérias quiser, com quantos alunos precisar. Sem pagar nada." },
  { titulo: "Seus estudos são seus", texto: "Seus resumos e mapas ficam guardados com você, organizados por matéria, para voltar sempre que precisar." },
];

const titulo = { antes: "Seu melhor amigo na hora de", destaque: "aprender" };

const app = {
  selo: "Em breve: app para iPhone e Android",
  sobretitulo: "Em breve",
  titulo: "A Repasa vai caber no seu bolso",
  texto:
    "Estamos preparando o aplicativo da Repasa para iPhone e Android, com tudo o que você já usa no site: matérias, resumos, mapas mentais e exercícios. E, claro, sem anúncios.",
  lojas: [
    { nome: "iPhone", detalhe: "App Store" },
    { nome: "Android", detalhe: "Google Play" },
  ],
  emBreve: "Em breve",
  enquantoIsso:
    "Enquanto isso, a Repasa já funciona no navegador do celular, e dá para colocá-la na tela inicial como se fosse um app.",
  tela: {
    saudacao: "Bom dia!",
    hoje: "Para hoje",
    tarefas: ["Revisar verbos", "Mapa de História", "10 exercícios"],
    sequencia: "3 dias seguidos",
  },
};

/** Atraso de cada item numa sequência, para eles aparecerem um depois do outro. */
const atraso = (i: number, passo = 90): CSSProperties => ({ "--atraso": `${i * passo}ms` }) as CSSProperties;

/** Estrelinha de quatro pontas, usada como enfeite. */
function Brilho({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor" aria-hidden="true">
      <path d="M12 2c.6 4.8 2.9 7.3 10 10-7.1 2.7-9.4 5.2-10 10-.6-4.8-2.9-7.3-10-10 7.1-2.7 9.4-5.2 10-10Z" />
    </svg>
  );
}

/** Folhinha solta, como as do Brotinho. */
function Folha({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor" aria-hidden="true">
      <path d="M4 20C4 10 10 4 21 3c-1 11-7 17-17 17Z" />
      <path d="M4 20 14 10" stroke="var(--fundo)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function IconeCelular({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="6" y="2.5" width="12" height="19" rx="3" />
      <path d="M10.5 18.5h3" />
    </svg>
  );
}

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function Inicio() {
  const perfil = await obterPerfil();

  return (
    // data-cores-repasa: a landing fica sempre no verde da Repasa, mesmo com a cor pessoal escolhida no perfil.
    <div data-cores-repasa className="landing flex min-h-screen flex-col overflow-x-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dadosEstruturadosInicio()).replace(/</g, "\\u003c") }}
      />
      <AnimacoesLanding />
      <Cabecalho />

      <main className="flex-1">
        {/* Abertura */}
        <section className="relative mx-auto grid w-full max-w-5xl items-center gap-12 px-4 pt-10 pb-20 md:grid-cols-[1.1fr_1fr] md:pt-16">
          <div className="min-w-0">
            <a
              href="#app"
              className="entrada inline-flex items-center gap-2 rounded-full border border-linha bg-fundo py-1 pr-3.5 pl-1.5 text-sm font-bold text-tinta shadow-sm transition-colors hover:border-primaria"
            >
              <span className="flex size-6 items-center justify-center rounded-full bg-primaria-suave text-primaria">
                <IconeCelular className="size-4" />
              </span>
              {app.selo}
              <span className="relative flex size-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-primaria opacity-60 motion-reduce:animate-none" />
                <span className="relative size-2 rounded-full bg-primaria" />
              </span>
            </a>
            <p className="entrada mt-6 text-sm font-bold tracking-wide text-primaria uppercase" style={atraso(1)}>
              Repasa, do espanhol repasar
            </p>
            <h1
              className="entrada mt-3 text-4xl leading-[1.08] font-extrabold tracking-tight text-balance sm:text-5xl"
              style={atraso(2)}
            >
              {titulo.antes}{" "}
              <span className="relative inline-block whitespace-nowrap text-primaria">
                {titulo.destaque}
                <svg
                  viewBox="0 0 200 16"
                  preserveAspectRatio="none"
                  className="rabisco absolute -bottom-2 left-0 h-3 w-full"
                  aria-hidden="true"
                >
                  <path
                    d="M3 11C40 4 80 3 118 6s56 4 79-1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                    pathLength={1}
                  />
                </svg>
              </span>
              .
            </h1>
            <p className="entrada mt-6 max-w-prose text-lg text-tinta-suave" style={atraso(3)}>
              Organize suas matérias, escreva resumos, monte mapas mentais e pratique com exercícios que explicam cada
              erro. Sozinho ou com o seu professor.
            </p>
            <div className="entrada mt-8 flex flex-wrap gap-3" style={atraso(4)}>
              {perfil ? (
                <Link href={paginaInicial(perfil.papel)} className={`${botaoPrimario} botao-pula`}>
                  {perfil.papel === "professor" ? "Ir para minhas turmas" : "Ir para meus estudos"}
                </Link>
              ) : (
                <>
                  <Link href="/cadastro?papel=aluno" className={`${botaoPrimario} botao-pula`}>
                    Começar a estudar
                  </Link>
                  <Link href="/entrar" className={botaoContorno}>
                    Entrar
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mesa de estudo (ilustrativa), com o Brotinho no canto. */}
          <div className="relative min-w-0" aria-hidden="true">
            <Brilho className="flutua absolute -top-6 -left-3 size-6 text-primaria" style={atraso(0)} />
            <Brilho className="flutua absolute top-10 -right-4 size-4 text-aviso" style={atraso(8, 150)} />
            <Folha className="flutua absolute -bottom-10 left-6 size-7 text-primaria/70" style={atraso(4, 150)} />
            <div className="cartao-mesa relative rounded-3xl border border-linha bg-suave p-5 shadow-[0_18px_40px_-24px_rgb(15_157_107/0.45)] sm:p-6">
              <div className="flex flex-wrap gap-1.5">
                {["Português", "Espanhol", "História"].map((m, i) => (
                  <span
                    key={m}
                    className={`entrada rounded-full px-3 py-1 text-xs font-bold ${i === 1 ? "bg-primaria text-white" : "bg-fundo text-tinta-suave"}`}
                    style={atraso(3 + i)}
                  >
                    {m}
                  </span>
                ))}
              </div>
              <div className="entrada mt-4 rounded-2xl border border-linha bg-fundo p-4" style={atraso(6)}>
                <p className="text-xs font-bold tracking-wide text-tinta-suave uppercase">Resumo</p>
                <p className="mt-1 text-lg font-extrabold">Pretérito imperfeito</p>
                <p className="mt-2 text-sm text-tinta-suave">
                  Usado para <mark className="marca-texto rounded px-1 text-tinta">hábitos no passado</mark> e para
                  descrever cenas.
                </p>
                <ul className="mt-2 list-disc pl-5 text-sm text-tinta-suave">
                  <li>-ar → -aba: repasaba</li>
                  <li>-er/-ir → -ía: comía, vivía</li>
                </ul>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-2 rounded-2xl border border-linha bg-fundo p-4 text-sm font-bold">
                <span className="entrada rounded-full bg-primaria-suave px-3 py-1 text-primaria" style={atraso(9)}>
                  Imperfeito
                </span>
                <span className="linha-mapa h-0.5 w-5 bg-linha" style={atraso(10)} />
                <span className="entrada rounded-full border border-linha px-3 py-1" style={atraso(11)}>
                  Hábitos
                </span>
                <span className="linha-mapa h-0.5 w-5 bg-linha" style={atraso(12)} />
                <span className="entrada rounded-full border border-linha px-3 py-1" style={atraso(13)}>
                  Descrições
                </span>
              </div>
              <div data-mascote className="absolute -right-1 -bottom-14 flex items-end gap-1 sm:-right-6">
                <span className="balao mb-3 rounded-2xl rounded-br-sm border border-linha bg-fundo px-3 py-1.5 text-sm font-bold shadow-sm">
                  Bora repassar?
                </span>
                <span className="brotinho-chega">
                  <span className="brotinho-pulinho block">
                    <Mascote pose="feliz" tamanho={92} animado />
                  </span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Recursos */}
        <section className="border-y border-linha bg-suave">
          <div className="mx-auto w-full max-w-5xl px-4 py-16">
            <h2 data-surgir className="text-3xl font-extrabold tracking-tight">
              Tudo o que ajuda você a aprender
            </h2>
            <p data-surgir className="mt-3 max-w-prose text-tinta-suave" style={atraso(1)}>
              A Repasa junta num lugar só o que normalmente fica espalhado entre caderno, aplicativo de notas e folha de
              exercício.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {recursos.map((r, i) => (
                <div
                  key={r.titulo}
                  data-surgir
                  style={atraso(i)}
                  className="cartao-recurso group rounded-3xl border border-linha bg-fundo p-6"
                >
                  <span className="icone-recurso flex size-11 items-center justify-center rounded-[12px] bg-primaria-suave text-primaria">
                    <svg
                      viewBox="0 0 24 24"
                      className="size-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      {r.icone}
                    </svg>
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
          <div data-surgir>
            <h2 className="text-3xl font-extrabold tracking-tight">Errou? A Repasa explica.</h2>
            <p className="mt-4 text-tinta-suave">
              Nada de “sete de dez, tente de novo”. Cada item é corrigido na hora e, quando a resposta não está certa, a
              explicação aparece logo abaixo, como se alguém estivesse estudando do seu lado.
            </p>
            <Link href="/experimente" className={`${botaoContorno} mt-6 inline-block`}>
              Experimentar uma atividade
            </Link>
          </div>
          <figure data-surgir style={atraso(1)} className="correcao rounded-3xl border border-linha bg-suave p-5 sm:p-6">
            <figcaption className="text-xs font-bold tracking-wide text-tinta-suave uppercase">Como é a correção</figcaption>
            <div className="mt-3 rounded-2xl border border-linha bg-fundo p-4">
              <p className="font-semibold">
                Antes del examen, yo siempre{" "}
                <span className="palavra-errada inline-block rounded-lg border-2 border-erro bg-erro-fundo px-2 py-0.5 text-erro line-through">
                  repasso
                </span>{" "}
                mis apuntes.
              </p>
              <div className="correcao-dica mt-3 rounded-xl bg-erro-fundo p-3 text-sm">
                <p className="font-bold text-erro">Quase! A resposta é “repaso”.</p>
                <p className="mt-1 text-tinta">
                  Em espanhol não existe “ss”. O som é o mesmo, mas a grafia leva um “s” só.
                </p>
              </div>
            </div>
            <div className="correcao-certa mt-3 rounded-2xl border border-linha bg-fundo p-4">
              <p className="font-semibold">
                Antes del examen, yo siempre{" "}
                <span className="palavra-certa inline-block rounded-lg border-2 border-certo bg-certo-fundo px-2 py-0.5 text-certo">
                  repaso
                </span>{" "}
                mis apuntes.
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-sm font-bold text-certo">
                <svg
                  viewBox="0 0 24 24"
                  className="size-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m5 12.5 4.5 4.5L19 7.5" />
                </svg>
                Isso! Agora está certo.
              </p>
            </div>
          </figure>
        </section>

        {/* A palavra */}
        <section className="border-y border-linha bg-suave">
          <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-16 md:grid-cols-2">
            <div data-surgir>
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

            <div data-surgir style={atraso(1)} className="rounded-3xl border border-linha bg-fundo p-6">
              <p className="text-3xl font-extrabold tracking-tight">
                re·pa·sar
                <span className="ml-3 align-middle text-sm font-semibold text-tinta-suave">verbo · espanhol</span>
              </p>
              <ol className="mt-5 space-y-4">
                {acepcoes.map((a, i) => (
                  <li key={a.exemplo} data-surgir style={atraso(i + 2, 120)} className="flex gap-3">
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
            <div data-surgir className="cartao-recurso rounded-3xl border border-linha p-6">
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
            <div data-surgir style={atraso(1)} className="cartao-recurso rounded-3xl border border-linha p-6">
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

        {/* Aplicativo em breve */}
        <section id="app" className="scroll-mt-20 px-4 pb-16">
          <div className="relative mx-auto grid max-w-5xl items-center gap-10 overflow-hidden rounded-3xl bg-primaria-suave px-6 py-12 md:grid-cols-[1.2fr_1fr] md:px-12">
            <Brilho className="flutua absolute top-6 right-[42%] hidden size-5 text-primaria md:block" style={atraso(3, 150)} />
            <Folha className="flutua absolute bottom-6 left-[46%] hidden size-6 text-primaria/60 md:block" style={atraso(6, 150)} />
            <div data-surgir className="relative">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primaria px-3 py-1 text-xs font-extrabold tracking-wide text-white uppercase">
                <IconeCelular className="size-3.5" />
                {app.sobretitulo}
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">{app.titulo}</h2>
              <p className="mt-4 max-w-prose text-tinta-suave">{app.texto}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                {app.lojas.map((l, i) => (
                  <div
                    key={l.nome}
                    data-surgir
                    style={atraso(i + 1, 120)}
                    className="flex items-center gap-3 rounded-2xl bg-tinta py-2.5 pr-4 pl-3 text-fundo"
                  >
                    <IconeCelular className="size-7" />
                    <span className="leading-tight">
                      <span className="block text-[11px] font-bold opacity-75">
                        {app.emBreve} · {l.detalhe}
                      </span>
                      <span className="block text-lg font-extrabold">{l.nome}</span>
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-6 max-w-prose text-sm text-tinta-suave">{app.enquantoIsso}</p>
            </div>

            {/* Celular ilustrativo */}
            <div data-surgir style={atraso(1)} className="relative mx-auto" aria-hidden="true">
              <div className="celular-flutua relative w-56 rounded-[2.2rem] border-[7px] border-tinta bg-fundo p-3 shadow-[0_30px_50px_-28px_rgb(16_35_58/0.6)]">
                <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-linha" />
                <div className="flex items-center gap-2">
                  <IconeLogo tamanho={26} />
                  <span className="text-sm font-extrabold">Repasa</span>
                </div>
                <p className="mt-3 text-lg font-extrabold">{app.tela.saudacao}</p>
                <p className="text-[11px] font-bold tracking-wide text-tinta-suave uppercase">{app.tela.hoje}</p>
                <ul className="mt-2 space-y-1.5">
                  {app.tela.tarefas.map((t, i) => (
                    <li
                      key={t}
                      className="flex items-center gap-2 rounded-xl border border-linha bg-suave px-2.5 py-2 text-xs font-bold"
                    >
                      <span
                        className={`flex size-4 shrink-0 items-center justify-center rounded-full border-2 ${i === 0 ? "border-primaria bg-primaria text-white" : "border-linha"}`}
                      >
                        {i === 0 && (
                          <svg viewBox="0 0 24 24" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m5 12.5 4.5 4.5L19 7.5" />
                          </svg>
                        )}
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex items-center justify-between rounded-xl bg-primaria-suave px-2.5 py-2">
                  <span className="text-xs font-extrabold text-primaria">{app.tela.sequencia}</span>
                  <Mascote pose="lendo" tamanho={44} animado />
                </div>
                <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-linha" />
              </div>
              <span className="selo-em-breve absolute -top-3 -right-6 rounded-full bg-aviso-fundo px-3 py-1 text-xs font-extrabold text-aviso shadow-sm">
                {app.emBreve}
              </span>
            </div>
          </div>
        </section>

        {/* Promessas */}
        <section className="mx-auto w-full max-w-5xl px-4 pb-16">
          <h2 data-surgir className="text-3xl font-extrabold tracking-tight">
            O que a gente promete
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {promessas.map((p, i) => (
              <div key={p.titulo} data-surgir style={atraso(i, 120)} className="border-l-4 border-primaria pl-4">
                <h3 className="text-lg font-extrabold">{p.titulo}</h3>
                <p className="mt-2 text-tinta-suave">{p.texto}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Fecho */}
        <section className="px-4 pb-20">
          <div
            data-surgir
            className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-tinta px-6 pt-10 pb-12 text-center text-fundo"
          >
            <Brilho className="flutua absolute top-8 left-[12%] size-5 text-primaria" style={atraso(0)} />
            <Brilho className="flutua absolute right-[14%] bottom-10 size-4 text-aviso-fundo" style={atraso(5, 150)} />
            <Folha className="flutua absolute top-12 right-[22%] size-6 text-primaria/70" style={atraso(9, 150)} />
            <span className="brotinho-pulinho mx-auto block w-fit" aria-hidden="true">
              <Mascote pose="feliz" tamanho={84} animado />
            </span>
            <p className="mt-2 text-4xl font-extrabold tracking-tight" lang="es">
              ¡Repasa!
            </p>
            <p className="mx-auto mt-3 max-w-md opacity-80">
              Crie sua conta, abra sua primeira matéria e comece a estudar. É grátis.
            </p>
            <Link
              href={perfil ? paginaInicial(perfil.papel) : "/cadastro?papel=aluno"}
              className="botao-pula mt-6 inline-block rounded-full bg-primaria px-6 py-2.5 font-bold text-white transition-opacity hover:opacity-90"
            >
              {perfil ? "Ir para meus estudos" : "Começar a estudar"}
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-linha py-6 text-center text-xs text-tinta-suave">
        Repasa · repasa.com.br · Sem anúncios, nunca. ·{" "}
        <Link href="/privacidade" className="hover:underline">
          Privacidade
        </Link>{" "}
        ·{" "}
        <Link href="/termos" className="hover:underline">
          Termos de uso
        </Link>{" "}
        ·{" "}
        <Link href="/sugestoes" className="hover:underline">
          Sugestões e contato
        </Link>
        <br />
        A Repasa está em versão beta: nova, grátis e sem limites enquanto está em testes. Conte o que achou em Sugestões.
      </footer>
    </div>
  );
}
