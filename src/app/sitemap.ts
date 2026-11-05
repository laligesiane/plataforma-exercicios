import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { aulasDemo } from "@/lib/exemplos/aulasDemo";
import { supabaseAnonKey, supabaseConfigurado, supabaseUrl } from "@/lib/supabase/config";
import { URL_SITE } from "@/lib/seo/site";

// Refaz a lista a cada hora, para atividades e páginas de professor novas aparecerem.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fixas: MetadataRoute.Sitemap = [
    { url: `${URL_SITE}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${URL_SITE}/experimente`, changeFrequency: "monthly", priority: 0.8 },
    ...aulasDemo.map((a) => ({ url: `${URL_SITE}/experimente/${a.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    { url: `${URL_SITE}/biblioteca`, changeFrequency: "daily", priority: 0.8 },
    { url: `${URL_SITE}/cadastro`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${URL_SITE}/entrar`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${URL_SITE}/privacidade`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${URL_SITE}/termos`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${URL_SITE}/sugestoes`, changeFrequency: "yearly", priority: 0.3 },
  ];
  if (!supabaseConfigurado) return fixas;

  // Sem cookie de sessão: só o que qualquer visitante vê (o RLS garante).
  const supabase = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
  const [{ data: atividades }, { data: paginas }] = await Promise.all([
    supabase
      .from("atividade")
      .select("id, atualizada_em")
      .eq("publicada", true)
      .eq("publica", true)
      .order("atualizada_em", { ascending: false })
      .limit(5000),
    supabase.from("pagina_professor").select("apelido, atualizada_em").eq("publicada", true).limit(5000),
  ]);

  return [
    ...fixas,
    ...(paginas ?? []).map((p) => ({
      url: `${URL_SITE}/p/${p.apelido}`,
      lastModified: p.atualizada_em ?? undefined,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...(atividades ?? []).map((a) => ({
      url: `${URL_SITE}/atividades/${a.id}`,
      lastModified: a.atualizada_em ?? undefined,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
