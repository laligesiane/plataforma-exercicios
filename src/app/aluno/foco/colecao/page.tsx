import { especieTx, seloTx } from "@/i18n/dicionarios/focoPt";
import { LANG_HTML, fmt } from "@/i18n/config";
import { obterDicionario, obterIdioma } from "@/i18n/servidor";
import Link from "next/link";
import { MedalhaSelo } from "@/components/foco/MedalhaSelo";
import { PlantaFoco } from "@/components/PlantaFoco";
import { botaoPrimario } from "@/components/ui/estilos";
import { hojeNoFuso } from "@/lib/aulas";
import { ULTIMA_FASE } from "@/lib/foco";
import { ESPECIES, calcularSelos, resumoDaColecao, sequenciaAtual, type ArvoreColhida } from "@/lib/foco/colecao";
import { exigirPapel } from "@/lib/perfil";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { LayoutConta } from "../../LayoutConta";

export async function generateMetadata() {
  const d = await obterDicionario();
  return { title: `${d.foco.colecao} · Repasa` };
}

type Linha = ArvoreColhida & { id: string; plantada_em: string };

function dataCurta(dia: string, locale: string) {
  const [a, m, d] = dia.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d)).toLocaleDateString(locale, { day: "numeric", month: "short", timeZone: "UTC" });
}

export default async function ColecaoDeArvores() {
  const perfil = await exigirPapel("aluno");
  const [dic, idioma] = await Promise.all([obterDicionario(), obterIdioma()]);
  const t = dic.foco;
  const locale = LANG_HTML[idioma];
  const arvoresTx = (n: number) => (n === 1 ? t.arvore1 : fmt(t.arvoresN, { n }));
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from("arvore_foco")
    .select("id, especie, minutos, dia, plantada_em")
    .eq("aluno_id", perfil.id)
    .order("plantada_em", { ascending: false });
  const arvores = (data ?? []) as Linha[];

  const r = resumoDaColecao(arvores);
  const selos = calcularSelos(arvores);
  const conquistados = selos.filter((s) => s.conquistado).length;
  const seguidos = sequenciaAtual(arvores.map((a) => a.dia), hojeNoFuso());
  const porEspecie = new Map<string, number>();
  for (const a of arvores) porEspecie.set(a.especie, (porEspecie.get(a.especie) ?? 0) + 1);

  const dias = new Map<string, Linha[]>();
  for (const a of arvores.slice(0, 120)) dias.set(a.dia, [...(dias.get(a.dia) ?? []), a]);

  return (
    <LayoutConta titulo={t.colecao} descricao={t.colecaoDescricao}>
      <Link href="/aluno/foco" className="mt-4 inline-block text-sm font-bold text-primaria hover:underline">
        ‹ {t.voltarFoco}
      </Link>

      {error && (
        <p className="mt-6 rounded-2xl bg-suave p-4 text-sm text-tinta-suave">{t.colecaoIndisponivel}</p>
      )}

      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          [t.arvores, String(r.arvores)],
          [t.horasFoco, (r.minutos / 60).toLocaleString(locale, { maximumFractionDigits: 1 })],
          [t.diasSeguidos, String(seguidos)],
          [t.selosTitulo, `${conquistados}/${selos.length}`],
        ].map(([rotulo, valor]) => (
          <div key={rotulo} className="rounded-2xl bg-primaria-suave p-4">
            <dt className="text-xs font-bold text-tinta-suave">{rotulo}</dt>
            <dd className="text-2xl font-extrabold tabular-nums">{valor}</dd>
          </div>
        ))}
      </dl>

      {arvores.length === 0 && !error && (
        <div className="mt-6 flex flex-col items-center rounded-3xl border border-linha p-6 text-center">
          <PlantaFoco fase={0} pausado tamanho={120} textos={t} />
          <p className="mt-2 font-extrabold">{t.vazia}</p>
          <p className="text-sm text-tinta-suave">{t.vaziaTexto}</p>
          <Link href="/aluno/foco" className={`${botaoPrimario} mt-4`}>
            {t.comecar}
          </Link>
        </div>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-extrabold">{t.selosTitulo}</h2>
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {selos.map((s) => (
            <li key={s.id} className={`flex items-center gap-3 rounded-2xl border p-3 ${s.conquistado ? "border-linha" : "border-dashed border-linha"}`}>
              <MedalhaSelo selo={s} conquistado={s.conquistado} tamanho={44} />
              <div className="min-w-0">
                <p className={`text-sm font-extrabold ${s.conquistado ? "" : "text-tinta-suave"}`}>{seloTx(t, s.id).nome}</p>
                <p className="text-xs text-tinta-suave">{seloTx(t, s.id).descricao}</p>
                {!s.conquistado && s.atual > 0 && (
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-suave" aria-label={fmt(t.deN, { n: s.atual, total: s.meta })}>
                    <div className="h-full rounded-full bg-primaria" style={{ width: `${(s.atual / s.meta) * 100}%` }} />
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-extrabold">
          {t.especiesTitulo} <span className="text-sm font-bold text-tinta-suave">{fmt(t.deN, { n: porEspecie.size, total: ESPECIES.length })}</span>
        </h2>
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {ESPECIES.map((e) => {
            const n = porEspecie.get(e.id) ?? 0;
            return (
              <li key={e.id} className="flex flex-col items-center rounded-2xl bg-suave p-3 text-center">
                <div className={n > 0 ? "" : "opacity-25 grayscale"}>
                  <PlantaFoco fase={ULTIMA_FASE} especie={e.id} tamanho={84} animado={false} textos={t} />
                </div>
                <p className="mt-1 text-sm font-extrabold">{n > 0 ? especieTx(t, e.id).nome : "???"}</p>
                <p className="text-xs text-tinta-suave">{n > 0 ? arvoresTx(n) : t.naoApareceu}</p>
              </li>
            );
          })}
        </ul>
      </section>

      {dias.size > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-extrabold">{t.bosque}</h2>
          <ul className="mt-3 space-y-3">
            {[...dias.entries()].map(([dia, lista]) => (
              <li key={dia} className="rounded-2xl border border-linha p-3">
                <p className="text-sm font-bold">
                  {dataCurta(dia, locale)}{" "}
                  <span className="font-semibold text-tinta-suave">
                    · {arvoresTx(lista.length)} · {lista.reduce((s, a) => s + a.minutos, 0)} min
                  </span>
                </p>
                <ul className="mt-2 flex flex-wrap gap-1">
                  {lista.map((a) => (
                    <li key={a.id} title={`${ESPECIES.some((e) => e.id === a.especie) ? especieTx(t, a.especie).nome : t.arvore} · ${a.minutos} min`}>
                      <PlantaFoco fase={ULTIMA_FASE} especie={a.especie} tamanho={48} animado={false} textos={t} />
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      )}
    </LayoutConta>
  );
}
