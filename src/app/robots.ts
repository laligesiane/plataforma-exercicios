import type { MetadataRoute } from "next";
import { CAMINHOS_PRIVADOS, URL_SITE } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  // Prévias da Vercel não entram no Google: só o domínio oficial é indexado.
  const producao = process.env.VERCEL_ENV ? process.env.VERCEL_ENV === "production" : true;
  return {
    rules: producao ? { userAgent: "*", allow: "/", disallow: CAMINHOS_PRIVADOS } : { userAgent: "*", disallow: "/" },
    sitemap: `${URL_SITE}/sitemap.xml`,
    host: URL_SITE,
  };
}
