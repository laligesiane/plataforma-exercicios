"use client";

import { useRouter } from "next/navigation";
import { startTransition } from "react";
import { TelaDeErro } from "@/components/TelaDeErro";

/** Erro dentro de uma página: mostra a tela amigável e mantém o resto do site funcionando. */
export default function Erro({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();
  return (
    <TelaDeErro
      erro={error}
      tentarDeNovo={() =>
        startTransition(() => {
          router.refresh();
          reset();
        })
      }
    />
  );
}
