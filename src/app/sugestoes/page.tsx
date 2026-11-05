import type { Metadata } from "next";
import { Lista, PaginaTexto, Secao } from "@/components/legal/PaginaTexto";
import { EMAIL_CONTATO } from "@/lib/contato";

export const metadata: Metadata = {
  title: "Sugestões e contato · Repasa",
  description: "A Repasa é nova, grátis e ilimitada enquanto está em testes. Conte o que achou: sugestões, elogios e reclamações.",
  alternates: { canonical: "/sugestoes" },
};

const TIPOS = [
  { assunto: "Sugestão para a Repasa", rotulo: "Mandar uma sugestão", texto: "Uma ideia, algo que faltou ou que poderia ser mais fácil." },
  { assunto: "Elogio para a Repasa", rotulo: "Mandar um elogio", texto: "Algo que te ajudou a estudar ou a dar aula." },
  { assunto: "Reclamação ou erro na Repasa", rotulo: "Contar um problema", texto: "Algo que não funcionou, confundiu ou incomodou." },
];

function link(assunto: string) {
  const corpo = "Escreva aqui o que você achou:\n\n\nSe for um erro, conte em qual tela estava e o que aconteceu.";
  return `mailto:${EMAIL_CONTATO}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
}

export default function Sugestoes() {
  return (
    <PaginaTexto titulo="Sua opinião vale muito" subtitulo="Sugestões, elogios e reclamações">
      <p>
        A Repasa é nova e está em fase de testes. Por isso, agora, tudo é <strong className="text-tinta">grátis e
        ilimitado</strong>. Nesta fase, o que mais vale para nós não é dinheiro: são as suas sugestões. Cada mensagem é
        lida e ajuda a decidir o que melhorar primeiro.
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        {TIPOS.map((t) => (
          <a
            key={t.assunto}
            href={link(t.assunto)}
            className="rounded-2xl border border-linha bg-fundo p-4 transition-colors hover:border-primaria"
          >
            <span className="block font-extrabold text-primaria">{t.rotulo}</span>
            <span className="mt-1 block text-sm">{t.texto}</span>
          </a>
        ))}
      </div>

      <Secao titulo="Prefere escrever direto?">
        <p>
          Mande um e-mail para{" "}
          <a href={`mailto:${EMAIL_CONTATO}`} className="font-bold text-primaria hover:underline">{EMAIL_CONTATO}</a>.
          Respondemos o mais rápido possível.
        </p>
        <Lista>
          <li>Se for um erro, conte em qual tela você estava e o que tentou fazer. Um print ajuda muito.</li>
          <li>Pedidos sobre seus dados pessoais (cópia, correção ou exclusão) também vão para esse e-mail.</li>
        </Lista>
      </Secao>
    </PaginaTexto>
  );
}
