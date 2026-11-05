import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Figtree } from "next/font/google";
import { scriptLeitura } from "@/components/PreferenciasLeitura";
import { FocoProvider } from "@/components/foco/FocoProvider";
import { MiniBrotinho } from "@/components/foco/MiniBrotinho";
import { CHAVE_SESSAO } from "@/lib/foco";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin", "latin-ext"],
});

// Letra pensada para leitura fácil; só é usada com "Leitura com mais espaço" ligada.
const atkinson = Atkinson_Hyperlegible({
  variable: "--font-atkinson",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  preload: false,
});

export const metadata: Metadata = {
  title: "Repasa",
  description: "Seu melhor amigo na hora de aprender: matérias, resumos, mapas mentais e exercícios que explicam cada erro.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Marca o foco antes de pintar a página, para o menu não piscar ao recarregar. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem(${JSON.stringify(CHAVE_SESSAO)}))document.documentElement.dataset.foco="ativo"}catch(e){}`,
          }}
        />
        <script dangerouslySetInnerHTML={{ __html: scriptLeitura }} />
      </head>
      <body className={`${figtree.variable} ${atkinson.variable} antialiased`}>
        <FocoProvider>
          {children}
          <MiniBrotinho />
        </FocoProvider>
      </body>
    </html>
  );
}
