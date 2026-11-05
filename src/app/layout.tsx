import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible, Figtree } from "next/font/google";
import { Analytics } from "@/components/Analytics";
import { scriptLeitura } from "@/components/PreferenciasLeitura";
import { scriptTema } from "@/components/Tema";
import { FocoProvider } from "@/components/foco/FocoProvider";
import { CelebracaoArvore } from "@/components/foco/CelebracaoArvore";
import { MiniBrotinho } from "@/components/foco/MiniBrotinho";
import { CHAVE_SESSAO } from "@/lib/foco";
import { DESCRICAO_SITE, URL_SITE } from "@/lib/seo/site";
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
  metadataBase: new URL(URL_SITE),
  title: "Repasa: seu melhor amigo na hora de aprender",
  description: DESCRICAO_SITE,
  applicationName: "Repasa",
  keywords: ["resumos", "mapa mental", "exercícios online", "estudar", "plataforma para professores", "atividades para alunos", "flashcards"],
  openGraph: {
    type: "website",
    siteName: "Repasa",
    locale: "pt_BR",
    url: "/",
    title: "Repasa: seu melhor amigo na hora de aprender",
    description: DESCRICAO_SITE,
  },
  twitter: { card: "summary_large_image" },
  // Google Search Console pela meta tag (opcional: a verificação pelo DNS dispensa isto).
  verification: process.env.NEXT_PUBLIC_GOOGLE_VERIFICACAO ? { google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICACAO } : undefined,
  appleWebApp: { capable: true, title: "Repasa", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  // viewport-fit=cover libera o env(safe-area-inset-bottom) das barras presas no rodapé (iPhone).
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1a17" },
  ],
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
        <script dangerouslySetInnerHTML={{ __html: scriptTema }} />
      </head>
      <body className={`${figtree.variable} ${atkinson.variable} antialiased`}>
        <FocoProvider>
          {children}
          <MiniBrotinho />
          <CelebracaoArvore />
          <Analytics />
        </FocoProvider>
      </body>
    </html>
  );
}
