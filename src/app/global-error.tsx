"use client";

import { TelaDeErro } from "@/components/TelaDeErro";
import "./globals.css";

/** Último recurso, quando até a moldura do site quebra. Precisa ter o próprio html e body. */
export default function ErroGeral({ error }: { error: Error & { digest?: string } }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <TelaDeErro erro={error} />
      </body>
    </html>
  );
}
