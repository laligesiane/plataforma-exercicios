/** Endereço oficial da Repasa, usado em links absolutos (sitemap, Open Graph, dados estruturados). */
export const URL_SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://repasa.com.br").replace(/\/$/, "");

export const DESCRICAO_SITE =
  "Seu melhor amigo na hora de aprender: matérias, resumos, mapas mentais e exercícios que explicam cada erro. Grátis e sem anúncios.";

/** Áreas com login ou sem valor para busca: o Google não precisa visitar. */
export const CAMINHOS_PRIVADOS = [
  "/aluno",
  "/professor",
  "/perfil",
  "/api/",
  "/auth/",
  "/bem-vindo",
  "/definir-senha",
  "/esqueci-senha",
  "/t/",
  "/agenda/",
  "/resumos/",
];

/** Dados estruturados (schema.org) da página inicial: quem é a Repasa e o que ela oferece. */
export function dadosEstruturadosInicio() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${URL_SITE}/#organizacao`,
        name: "Repasa",
        url: URL_SITE,
        logo: `${URL_SITE}/icones/icone-512.png`,
      },
      {
        "@type": "WebSite",
        "@id": `${URL_SITE}/#site`,
        name: "Repasa",
        url: URL_SITE,
        inLanguage: "pt-BR",
        publisher: { "@id": `${URL_SITE}/#organizacao` },
      },
      {
        "@type": "WebApplication",
        name: "Repasa",
        url: URL_SITE,
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web, Android, iOS",
        inLanguage: "pt-BR",
        description: DESCRICAO_SITE,
        offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
        publisher: { "@id": `${URL_SITE}/#organizacao` },
      },
    ],
  };
}
