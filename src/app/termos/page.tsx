import type { Metadata } from "next";
import Link from "next/link";
import { Lista, PaginaTexto, Secao } from "@/components/legal/PaginaTexto";
import { ATUALIZADO_EM, EMAIL_CONTATO } from "@/lib/contato";

export const metadata: Metadata = {
  title: "Termos de uso · Repasa",
  description: "As regras para usar a Repasa: contas, conteúdo, turmas, menores de idade e versão beta.",
  alternates: { canonical: "/termos" },
};

const email = <a href={`mailto:${EMAIL_CONTATO}`} className="font-bold text-primaria hover:underline">{EMAIL_CONTATO}</a>;

export default function Termos() {
  return (
    <PaginaTexto titulo="Termos de uso" subtitulo={`Atualizados em ${ATUALIZADO_EM}`}>
      <p>
        Ao criar uma conta ou usar a Repasa (repasa.com.br), você concorda com estes termos e com a{" "}
        <Link href="/privacidade" className="font-bold text-primaria hover:underline">política de privacidade</Link>.
      </p>

      <Secao titulo="1. O que é a Repasa">
        <p>
          Uma plataforma de estudos: alunos organizam matérias, resumos e mapas mentais e praticam com exercícios que
          explicam cada erro; professores criam turmas, atividades e acompanham os alunos.
        </p>
      </Secao>

      <Secao titulo="2. Versão beta, grátis e ilimitada">
        <p>
          A Repasa é nova e está em fase de testes. Por enquanto tudo é gratuito e sem limites. Algumas funções podem
          mudar, sair do ar por um tempo ou ter erros, e podemos criar planos pagos no futuro. Se isso acontecer, avisamos
          antes e nada que você já criou será apagado por causa disso. A Repasa nunca terá anúncios.
        </p>
      </Secao>

      <Secao titulo="3. Sua conta">
        <Lista>
          <li>Use dados verdadeiros e mantenha sua senha em segredo. O que for feito na sua conta é responsabilidade sua.</li>
          <li>Menores de 18 anos devem usar a Repasa com o conhecimento de um responsável; menores de 12 anos, só com o consentimento de um dos pais ou responsável.</li>
          <li>Você pode excluir sua conta a qualquer momento no seu perfil.</li>
        </Lista>
      </Secao>

      <Secao titulo="4. Professores e turmas">
        <Lista>
          <li>Convide só pessoas que querem participar da sua turma. Não use convites para mandar mensagens a quem não conhece.</li>
          <li>Ao convidar alunos menores de idade, você declara ter a autorização da escola ou da família.</li>
          <li>Use os dados dos seus alunos (nome, e-mail, respostas) só para acompanhar os estudos deles.</li>
        </Lista>
      </Secao>

      <Secao titulo="5. Seu conteúdo">
        <p>
          O que você cria (resumos, atividades, exercícios) continua sendo seu. Você nos autoriza apenas a guardar, mostrar
          e processar esse conteúdo para a Repasa funcionar, por exemplo para mostrar uma atividade pública ou gerar um
          áudio do resumo. Publique só o que você tem direito de usar.
        </p>
      </Secao>

      <Secao titulo="6. O que não é permitido">
        <Lista>
          <li>Publicar conteúdo ilegal, ofensivo, discriminatório, sexual ou que exponha outras pessoas.</li>
          <li>Enviar spam, tentar acessar contas ou dados de outras pessoas ou atrapalhar o funcionamento do site.</li>
          <li>Copiar conteúdo de outros professores como se fosse seu.</li>
        </Lista>
        <p>Podemos remover conteúdo ou suspender contas que desrespeitem estas regras.</p>
      </Secao>

      <Secao titulo="7. Responsabilidade">
        <p>
          Fazemos o possível para a Repasa funcionar bem e com segurança, mas, por ser uma versão beta, ela é oferecida
          como está. Correções automáticas e exercícios gerados com IA podem conter erros: na dúvida, confira com seu
          professor ou material.
        </p>
      </Secao>

      <Secao titulo="8. Contato e mudanças">
        <p>
          Dúvidas, sugestões ou reclamações: {email} ou a página de{" "}
          <Link href="/sugestoes" className="font-bold text-primaria hover:underline">sugestões</Link>. Se estes termos
          mudarem de forma importante, avisamos no site. Valem as leis do Brasil.
        </p>
      </Secao>
    </PaginaTexto>
  );
}
