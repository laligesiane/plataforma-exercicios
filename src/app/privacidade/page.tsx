import type { Metadata } from "next";
import { Cabecalho } from "@/components/Cabecalho";
import { EscolhaCookies } from "@/components/EscolhaCookies";

export const metadata: Metadata = { title: "Privacidade e cookies · Repasa" };

export default function Privacidade() {
  return (
    <div className="flex min-h-screen flex-col">
      <Cabecalho />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-8 pb-24">
        <h1 className="text-3xl leading-tight font-extrabold tracking-tight">Privacidade e cookies</h1>

        <div className="mt-6 space-y-6 text-tinta-suave">
          <section>
            <h2 className="mb-2 text-lg font-extrabold text-tinta">Cookies necessários</h2>
            <p>
              Para você entrar na sua conta e a Repasa lembrar suas preferências (cor, leitura, modo foco), usamos
              cookies e o armazenamento do navegador. Sem eles o site não funciona, por isso não pedimos permissão para
              esses.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-extrabold text-tinta">Cookies de estatística (Google Analytics)</h2>
            <p>
              Só com a sua permissão, usamos o Google Analytics para contar visitas e ver quais partes da Repasa são mais
              usadas, como cadastros, atividades enviadas, resumos criados e jogos concluídos. Isso nos ajuda a decidir
              o que melhorar.
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Não enviamos seu nome, e-mail nem o que você escreve.</li>
              <li>Os sinais de publicidade do Google ficam desligados. A Repasa não tem anúncios, nunca.</li>
              <li>Se você recusar, nada é enviado ao Google Analytics.</li>
            </ul>
          </section>

          {process.env.NEXT_PUBLIC_GA_ID && (
            <section className="rounded-2xl border border-linha bg-fundo p-4">
              <h2 className="mb-2 text-lg font-extrabold text-tinta">Sua escolha</h2>
              <EscolhaCookies />
            </section>
          )}

          <section>
            <h2 className="mb-2 text-lg font-extrabold text-tinta">Seus direitos (LGPD)</h2>
            <p>
              Você pode mudar sua escolha sobre cookies a qualquer momento nesta página ou no seu perfil. Para pedir
              acesso, correção ou exclusão dos seus dados, fale com a Repasa pelo e-mail de contato do site.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
