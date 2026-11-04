"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { criarClienteNavegador } from "@/lib/supabase/navegador";

// O e-mail padrão de convite do Supabase volta com a sessão no fragmento (#access_token=...),
// que só o navegador consegue ler.
export default function RetornoConvite() {
  const router = useRouter();

  useEffect(() => {
    const parametros = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = parametros.get("access_token");
    const refreshToken = parametros.get("refresh_token");

    if (!accessToken || !refreshToken) {
      router.replace("/entrar?erro=link");
      return;
    }

    criarClienteNavegador()
      .auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => router.replace(error ? "/entrar?erro=link" : "/definir-senha"));
  }, [router]);

  return <p className="px-4 py-16 text-center text-tinta-suave">Abrindo seu convite...</p>;
}
