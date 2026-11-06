import type { Metadata } from "next";
import Link from "next/link";
import { EscolhaCookies } from "@/components/EscolhaCookies";
import { Lista, PaginaTexto, Secao } from "@/components/legal/PaginaTexto";
import { ATUALIZADO_EM, EMAIL_CONTATO } from "@/lib/contato";

export const metadata: Metadata = {
  title: "Política de privacidade · Repasa",
  description: "Quais dados a Repasa coleta, para que usa, com quem compartilha, por quanto tempo guarda e como você pede para apagar.",
  alternates: { canonical: "/privacidade" },
};

const email = <a href={`mailto:${EMAIL_CONTATO}`} className="font-bold text-primaria hover:underline">{EMAIL_CONTATO}</a>;

export default function Privacidade() {
  return (
    <PaginaTexto titulo="Política de privacidade" subtitulo={`Atualizada em ${ATUALIZADO_EM}`}>
      <p>
        A Repasa (repasa.com.br) é uma plataforma de estudos para alunos e professores: matérias, resumos, mapas mentais,
        exercícios que explicam cada erro, turmas e agenda. Esta página explica, em linguagem simples, quais dados
        pessoais coletamos, para que usamos, com quem compartilhamos e como você controla tudo isso, conforme a Lei Geral
        de Proteção de Dados (LGPD, Lei 13.709/2018).
      </p>

      <Secao titulo="1. Quem cuida dos seus dados">
        <p>
          A Repasa é a controladora dos dados pessoais tratados no site. Para qualquer dúvida ou pedido sobre seus dados,
          escreva para {email}. Esse é também o contato da pessoa encarregada pelo tratamento de dados.
        </p>
      </Secao>

      <Secao titulo="2. Dados que coletamos">
        <Lista>
          <li><strong className="text-tinta">Dados da conta:</strong> nome, e-mail, senha (guardada de forma criptografada, nunca a vemos), tipo de conta (aluno ou professor), data de cadastro e último acesso.</li>
          <li><strong className="text-tinta">Se você entrar com o Google:</strong> nome, e-mail e foto do perfil da sua conta Google (veja a seção 4).</li>
          <li><strong className="text-tinta">O que você cria:</strong> matérias, resumos, mapas mentais, atividades, exercícios, turmas, horários, aulas, agenda, página pública de professor e arquivos que você envia (imagens, áudios e PDFs de calendário).</li>
          <li><strong className="text-tinta">O que você faz nos estudos:</strong> respostas dos exercícios, acertos e erros, revisões, dúvidas enviadas ao professor, produções escritas e gravações de voz (quando o exercício pede), correções do professor e progresso do modo foco.</li>
          <li><strong className="text-tinta">Preferências:</strong> cor da plataforma, opções de leitura, voz escolhida e escolha sobre cookies.</li>
          <li><strong className="text-tinta">Dados técnicos:</strong> endereço IP, tipo de navegador e registros de erro, necessários para o site funcionar com segurança.</li>
          <li><strong className="text-tinta">Estatísticas de uso:</strong> só se você aceitar os cookies de estatística (veja a seção 7).</li>
        </Lista>
        <p>Não coletamos documentos, endereço, telefone, dados de pagamento nem dados sensíveis.</p>
      </Secao>

      <Secao titulo="3. Para que usamos">
        <Lista>
          <li>Criar e manter sua conta e deixar você entrar com segurança.</li>
          <li>Mostrar seus estudos, corrigir exercícios e explicar os erros.</li>
          <li>Ligar professor e alunos da mesma turma: o professor vê o nome, o e-mail e o desempenho dos alunos das turmas dele; o aluno vê o nome do professor e o conteúdo da turma.</li>
          <li>Enviar e-mails da conta: confirmação de cadastro, código de entrada, troca de senha e convites de turma. Não mandamos propaganda.</li>
          <li>Melhorar a Repasa, responder pedidos de suporte e proteger o site contra abuso.</li>
        </Lista>
        <p>
          As bases legais são a execução do serviço que você pediu (art. 7º, V, da LGPD), o seu consentimento para
          cookies de estatística (art. 7º, I) e o legítimo interesse em manter o site seguro (art. 7º, IX).
        </p>
        <p className="font-bold text-tinta">A Repasa não vende dados, não tem anúncios e não usa seus dados para publicidade, nunca.</p>
      </Secao>

      <Secao titulo="4. Dados da sua conta Google" id="google">
        <p>
          O botão &quot;Continuar com Google&quot; serve só para você entrar sem criar senha. Quando você usa esse
          botão, o Google nos envia apenas o seu <strong className="text-tinta">nome, e-mail e foto do perfil</strong>{" "}
          (permissões &quot;openid&quot;, &quot;email&quot; e &quot;profile&quot;).
        </p>
        <Lista>
          <li>Usamos esses dados apenas para criar sua conta, identificar você ao entrar e mostrar seu nome na plataforma.</li>
          <li>Não acessamos seu Gmail, Google Drive, Google Agenda, contatos nem qualquer outro dado da sua conta Google.</li>
          <li>Não compartilhamos, vendemos nem transferimos esses dados para terceiros, e não os usamos para publicidade nem para treinar modelos de inteligência artificial.</li>
          <li>O botão &quot;Adicionar à Google Agenda&quot; da Repasa não usa login do Google: ele só entrega um link de assinatura do calendário, que você adiciona por conta própria.</li>
        </Lista>
        <p>
          O uso de informações recebidas das APIs do Google segue a{" "}
          <a href="https://developers.google.com/terms/api-services-user-data-policy" className="font-bold text-primaria hover:underline" target="_blank" rel="noreferrer">
            Política de Dados do Usuário dos Serviços de API do Google
          </a>
          , incluindo os requisitos de Uso Limitado. Você pode tirar o acesso da Repasa à sua conta Google a qualquer
          momento em{" "}
          <a href="https://myaccount.google.com/permissions" className="font-bold text-primaria hover:underline" target="_blank" rel="noreferrer">
            myaccount.google.com/permissions
          </a>
          .
        </p>
      </Secao>

      <Secao titulo="5. Com quem compartilhamos">
        <p>Só com serviços que fazem a Repasa funcionar, cada um usando os dados apenas para isso:</p>
        <Lista>
          <li><strong className="text-tinta">Supabase:</strong> banco de dados, login e arquivos.</li>
          <li><strong className="text-tinta">Vercel:</strong> hospedagem do site.</li>
          <li><strong className="text-tinta">Resend:</strong> envio dos e-mails da conta.</li>
          <li><strong className="text-tinta">Microsoft Azure:</strong> quando você usa a voz natural para ouvir um resumo, o trecho do texto é enviado para virar áudio.</li>
          <li><strong className="text-tinta">Anthropic:</strong> quando você pede para gerar exercícios de um resumo com IA, o texto do resumo é enviado para criar as perguntas. Quando você pede para gerar um resumo de um PDF, slides ou texto, o texto desse material é enviado para escrever o resumo (se o PDF for uma digitalização sem texto, o próprio PDF é enviado). Esses recursos só funcionam quando você clica para usá-los.</li>
          <li><strong className="text-tinta">Google Analytics:</strong> estatísticas de uso, só com a sua permissão.</li>
        </Lista>
        <p>
          Alguns desses serviços guardam dados fora do Brasil, com garantias de proteção previstas na LGPD. Também
          podemos compartilhar dados se uma lei ou ordem judicial exigir.
        </p>
      </Secao>

      <Secao titulo="6. Crianças e adolescentes">
        <p>
          Muitos alunos da Repasa são menores de idade. Por isso coletamos só o necessário para os estudos, não mostramos
          anúncios e não usamos dados de menores para nenhuma outra finalidade. Menores de 18 anos devem usar a Repasa com
          o conhecimento de um responsável, e crianças menores de 12 anos só com o consentimento de um dos pais ou
          responsável, que pode pedir acesso ou exclusão dos dados a qualquer momento pelo {email}. Professores que
          convidam alunos menores declaram ter a autorização da escola ou da família.
        </p>
      </Secao>

      <Secao titulo="7. Cookies" id="cookies">
        <p>
          <strong className="text-tinta">Necessários:</strong> para você entrar na sua conta e a Repasa lembrar suas
          preferências (cor, leitura, modo foco), usamos cookies e o armazenamento do navegador. Sem eles o site não
          funciona, por isso não pedimos permissão para esses.
        </p>
        <p>
          <strong className="text-tinta">Estatística (Google Analytics):</strong> só com a sua permissão, contamos
          visitas e quais partes são mais usadas (cadastros, atividades enviadas, resumos criados, jogos concluídos). Não
          enviamos seu nome, e-mail nem o que você escreve, e os sinais de publicidade do Google ficam desligados. Se você
          recusar, nada é enviado.
        </p>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <div className="rounded-2xl border border-linha bg-fundo p-4">
            <p className="mb-2 font-extrabold text-tinta">Sua escolha</p>
            <EscolhaCookies />
          </div>
        )}
      </Secao>

      <Secao titulo="8. Por quanto tempo guardamos">
        <p>
          Guardamos seus dados enquanto sua conta existir. Quando a conta é excluída, apagamos os dados dela em até 30
          dias, menos o que a lei obrigar a guardar por mais tempo. Cópias de segurança são apagadas no ciclo normal delas,
          em até 90 dias. Registros técnicos de acesso são guardados por 6 meses, como pede o Marco Civil da Internet.
        </p>
      </Secao>

      <Secao titulo="9. Seus direitos e como apagar seus dados" id="direitos">
        <p>Pela LGPD, você pode pedir a qualquer momento:</p>
        <Lista>
          <li>confirmação de que tratamos seus dados e uma cópia deles;</li>
          <li>correção de dados errados (o nome você mesmo corrige no seu perfil);</li>
          <li>exclusão da sua conta e de todos os seus dados;</li>
          <li>informação sobre com quem compartilhamos;</li>
          <li>retirada do consentimento dos cookies de estatística, nesta página ou no seu perfil.</li>
        </Lista>
        <p>
          Para pedir, escreva para {email} usando o e-mail da sua conta. Respondemos em até 15 dias. Você também pode
          reclamar à Autoridade Nacional de Proteção de Dados (ANPD).
        </p>
      </Secao>

      <Secao titulo="10. Segurança">
        <p>
          A conexão com o site é sempre criptografada (HTTPS), as senhas são guardadas criptografadas e cada pessoa só
          acessa o que é dela ou da sua turma, por regras aplicadas direto no banco de dados.
        </p>
      </Secao>

      <Secao titulo="11. Mudanças nesta política">
        <p>
          A Repasa é nova e está em versão beta, então esta política pode mudar. Quando houver mudança importante,
          avisamos no site antes. Veja também os <Link href="/termos" className="font-bold text-primaria hover:underline">termos de uso</Link>.
        </p>
      </Secao>
    </PaginaTexto>
  );
}
