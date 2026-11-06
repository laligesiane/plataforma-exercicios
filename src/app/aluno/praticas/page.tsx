import { LANG_HTML, fmt } from "@/i18n/config";
import { obterDicionario, obterIdioma } from "@/i18n/servidor";
import Link from "next/link";
import { exigirPapel } from "@/lib/perfil";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { LayoutConta } from "../LayoutConta";
import { contarItens } from "./dados";

export default async function MinhasPraticas() {
  await exigirPapel("aluno");
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("pratica")
    .select("id, titulo, exercicios, criada_em, resumo(id, titulo)")
    .order("criada_em", { ascending: false });
  const praticas = data ?? [];
  const [d, idioma] = await Promise.all([obterDicionario(), obterIdioma()]);
  const t = d.praticas;
  const formatoData = new Intl.DateTimeFormat(LANG_HTML[idioma], { day: "numeric", month: "short" });

  return (
    <LayoutConta titulo={t.titulo} descricao={t.descricao}>
      {praticas.length > 0 ? (
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {praticas.map((p) => {
            const resumo = p.resumo as unknown as { id: string; titulo: string } | null;
            const itens = contarItens(p.exercicios);
            return (
              <li key={p.id}>
                <Link
                  href={`/aluno/praticas/${p.id}`}
                  className="block h-full rounded-2xl border border-linha p-5 transition-colors hover:border-primaria"
                >
                  <span className="block font-bold">{p.titulo}</span>
                  <span className="mt-1 block text-sm text-tinta-suave">
                    {[resumo?.titulo?.trim() && fmt(t.de, { titulo: resumo.titulo }), itens === 1 ? t.item1 : fmt(t.itensN, { n: itens }), formatoData.format(new Date(p.criada_em))]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-linha p-6 text-center">
          <p className="font-semibold">{t.nenhuma}</p>
          <p className="mt-1 text-sm text-tinta-suave">{t.nenhumaTexto}</p>
          <Link href="/aluno/cursos" className="mt-3 inline-block text-sm font-bold text-primaria hover:underline">
            {t.verResumos}
          </Link>
        </div>
      )}
    </LayoutConta>
  );
}
