import type { MetadataRoute } from "next";

/** Deixa instalar a Repasa na tela inicial do celular, abrindo sem a barra do navegador. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Repasa",
    short_name: "Repasa",
    description: "Seu melhor amigo na hora de aprender.",
    lang: "pt-BR",
    start_url: "/aluno?origem=app",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0f9d6b",
    icons: [
      { src: "/icones/icone-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icones/icone-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icones/icone-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
