"use client";

import { useId, useRef, useState, useTransition, type ReactNode } from "react";
import { Mensagem, type EstadoFormulario } from "@/components/ui/Mensagem";
import { botaoIcone, botaoPrimario, botaoSecundario, botaoTexto, caixaMarcar, campo, rotulo } from "@/components/ui/estilos";
import {
  chaveItem,
  lerCalendario,
  lerIcs,
  lerTexto,
  MAX_ITENS,
  tiposImportados,
  type ItemImportado,
  type TipoImportado,
} from "@/lib/importar-calendario";

type Linha = ItemImportado & { uid: number; incluir: boolean; aviso?: string };

const traco = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const Icone = ({ children, className = "size-5" }: { children: ReactNode; className?: string }) => (
  <svg viewBox="0 0 24 24" className={`${className} shrink-0`} aria-hidden {...traco}>
    {children}
  </svg>
);
const IconeEnviar = () => (
  <Icone>
    <path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
  </Icone>
);
const IconeLixo = () => (
  <Icone className="size-4.5">
    <path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1l1-12M9 7V4h6v3" />
  </Icone>
);
const IconeMais = () => (
  <Icone className="size-4.5">
    <path d="M12 5v14M5 12h14" />
  </Icone>
);
const IconeRevisar = () => (
  <Icone>
    <rect x="3" y="4" width="18" height="17" rx="2" />
    <path d="M3 9h18M8 2v4M16 2v4M8.5 15l2.5 2.5 4.5-5" />
  </Icone>
);

/**
 * Importar calendário acadêmico: lê um .ics, um PDF ou um texto colado, mostra tudo para revisão
 * e só salva o que a pessoa deixar marcado. Nada é salvo sem passar pela revisão.
 */
export function ImportarCalendario({
  hoje,
  existentes,
  salvar,
  ondeSalva,
  pedirMateria,
}: {
  hoje: string;
  /** O que já está salvo, para não duplicar. */
  existentes: { data: string; titulo: string }[];
  salvar: (itens: string, materia: string) => Promise<EstadoFormulario>;
  /** "na sua agenda", "no calendário da turma". */
  ondeSalva: string;
  /** Aluno: campo "Matéria ou lugar" que vale para todas as linhas. */
  pedirMateria?: boolean;
}) {
  const id = useId();
  const [linhas, setLinhas] = useState<Linha[] | null>(null);
  const [texto, setTexto] = useState("");
  const [materia, setMateria] = useState("");
  const [estado, setEstado] = useState<EstadoFormulario>(null);
  const [lendo, setLendo] = useState(false);
  const [salvando, iniciar] = useTransition();
  const proximo = useRef(1);
  const arquivo = useRef<HTMLInputElement>(null);

  const jaTem = new Set(existentes.map(chaveItem));
  const paraRevisar = (itens: ItemImportado[]): Linha[] =>
    itens.map((i) => {
      const repetido = jaTem.has(chaveItem(i));
      const passou = (i.ate ?? i.data) < hoje;
      return {
        ...i,
        uid: proximo.current++,
        incluir: !repetido && !passou,
        aviso: repetido ? "Já está salvo" : passou ? "Já passou" : undefined,
      };
    });

  function abrirRevisao(itens: ItemImportado[], textoLido?: string) {
    if (itens.length === 0) {
      if (textoLido) setTexto(textoLido.slice(0, 50000));
      setEstado({
        erro: textoLido
          ? "Não achamos datas nesse arquivo. O texto dele está na caixa abaixo: dá para arrumar e tentar de novo."
          : "Não achamos datas. Confira se o texto tem dias como 15/03, 15/03/2027 ou 15 de março.",
      });
      return;
    }
    setEstado(null);
    setLinhas(paraRevisar(itens));
  }

  async function lerArquivo(f: File) {
    setEstado(null);
    const nome = f.name.toLowerCase();
    if (f.type.startsWith("image/")) {
      setEstado({
        erro: "Ainda não dá para ler foto. Se tiver o calendário em PDF, envie o PDF. Se não, digite ou cole as datas na caixa abaixo.",
      });
      return;
    }
    if (f.size > 15 * 1024 * 1024) {
      setEstado({ erro: "Arquivo grande demais (máximo 15 MB)." });
      return;
    }
    setLendo(true);
    try {
      if (nome.endsWith(".pdf") || f.type === "application/pdf") {
        const { textoDoPdf } = await import("@/lib/importar-calendario/pdf");
        const lido = await textoDoPdf(f);
        if (!lido.trim()) {
          setEstado({
            erro: "Esse PDF parece ser uma foto escaneada, sem texto para ler. Digite ou cole as datas na caixa abaixo.",
          });
          return;
        }
        abrirRevisao(lerTexto(lido, hoje), lido);
      } else {
        const conteudo = await f.text();
        abrirRevisao(nome.endsWith(".ics") ? lerIcs(conteudo) : lerCalendario(conteudo, hoje), conteudo);
      }
    } catch {
      setEstado({ erro: "Não conseguimos abrir esse arquivo. Tente outro, ou cole o texto na caixa abaixo." });
    } finally {
      setLendo(false);
      if (arquivo.current) arquivo.current.value = "";
    }
  }

  const mudar = (uid: number, mudanca: Partial<Linha>) =>
    setLinhas((ls) => ls?.map((l) => (l.uid === uid ? { ...l, ...mudanca } : l)) ?? null);

  const novaLinha = () =>
    setLinhas((ls) => [
      ...(ls ?? []),
      { uid: proximo.current++, incluir: true, titulo: "", data: hoje, ate: null, hora: null, tipo: "outro" },
    ]);

  const marcadas = linhas?.filter((l) => l.incluir) ?? [];

  function enviar() {
    setEstado(null);
    const itens = marcadas.map(({ titulo, data, ate, hora, tipo }) => ({ titulo, data, ate, hora, tipo }));
    iniciar(async () => {
      const r = await salvar(JSON.stringify(itens), materia);
      setEstado(r);
      if (r?.sucesso) {
        setLinhas(null);
        setTexto("");
      }
    });
  }

  if (!linhas) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-tinta-suave">
          Envie o calendário acadêmico ou cole o texto dele. A Repasa encontra as datas e mostra tudo para você conferir.
          Nada é salvo antes da sua revisão.
        </p>
        <div>
          <input
            ref={arquivo}
            id={`${id}-arquivo`}
            type="file"
            accept=".ics,.pdf,.txt,.csv,text/calendar,application/pdf,text/plain,image/*"
            className="sr-only"
            onChange={(e) => e.target.files?.[0] && lerArquivo(e.target.files[0])}
          />
          <label
            htmlFor={`${id}-arquivo`}
            className={`${botaoSecundario} inline-flex cursor-pointer items-center gap-2 ${lendo ? "pointer-events-none opacity-60" : ""}`}
          >
            <IconeEnviar />
            {lendo ? "Lendo o arquivo..." : "Enviar arquivo (PDF ou .ics)"}
          </label>
          <p className="mt-2 text-xs text-tinta-suave">
            O .ics sai do Google Agenda, do Outlook ou do sistema da faculdade (procure &quot;exportar&quot; ou
            &quot;assinar&quot;). O PDF é lido aqui mesmo no seu aparelho.
          </p>
        </div>
        <div>
          <label htmlFor={`${id}-texto`} className={rotulo}>
            Ou cole o texto do calendário
          </label>
          <textarea
            id={`${id}-texto`}
            rows={6}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder={"Ex.:\n15/02 - Início das aulas\n20 a 24/04 - Semana de provas\n21/04 - Feriado"}
            className={campo}
          />
        </div>
        <Mensagem estado={estado} />
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" disabled={!texto.trim()} onClick={() => abrirRevisao(lerCalendario(texto, hoje))} className={botaoPrimario}>
            Encontrar as datas
          </button>
          <button
            type="button"
            className={botaoTexto}
            onClick={() => {
              setEstado(null);
              setLinhas([]);
              novaLinha();
            }}
          >
            Prefiro digitar uma a uma
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl bg-primaria-suave p-4">
        <span className="mt-0.5 text-primaria">
          <IconeRevisar />
        </span>
        <p className="text-sm">
          <strong>Confira antes de salvar.</strong> {linhas.length} {linhas.length === 1 ? "data" : "datas"} na lista. Arrume o que
          estiver errado e desmarque o que não quiser. O que já passou ou já está salvo vem desmarcado.
        </p>
      </div>

      {pedirMateria && (
        <div>
          <label htmlFor={`${id}-materia`} className={rotulo}>
            Matéria ou lugar <span className="font-normal text-tinta-suave">(opcional, vale para todas)</span>
          </label>
          <input
            id={`${id}-materia`}
            value={materia}
            maxLength={100}
            onChange={(e) => setMateria(e.target.value)}
            placeholder="Ex.: Faculdade, Cálculo"
            className={campo}
          />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="font-bold">
          {marcadas.length} de {linhas.length} marcadas
        </span>
        <span className="flex gap-4">
          <button type="button" className={botaoTexto} onClick={() => setLinhas(linhas.map((l) => ({ ...l, incluir: true })))}>
            Marcar todas
          </button>
          <button type="button" className={botaoTexto} onClick={() => setLinhas(linhas.map((l) => ({ ...l, incluir: false })))}>
            Desmarcar todas
          </button>
        </span>
      </div>

      <ul className="space-y-3">
        {linhas.map((l, n) => {
          const p = `${id}-${l.uid}`;
          return (
            <li
              key={l.uid}
              className={`rounded-2xl border p-4 transition-opacity ${l.incluir ? "border-linha" : "border-dashed border-linha opacity-60"}`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={l.incluir}
                  onChange={(e) => mudar(l.uid, { incluir: e.target.checked })}
                  className={caixaMarcar}
                  aria-label={`Salvar a linha ${n + 1}`}
                />
                <label htmlFor={`${p}-titulo`} className="sr-only">
                  Nome da linha {n + 1}
                </label>
                <input
                  id={`${p}-titulo`}
                  value={l.titulo}
                  maxLength={200}
                  onChange={(e) => mudar(l.uid, { titulo: e.target.value })}
                  placeholder="Nome (ex.: Prova 1)"
                  className={`${campo} font-bold`}
                />
                <button
                  type="button"
                  className={botaoIcone}
                  onClick={() => setLinhas(linhas.filter((x) => x.uid !== l.uid))}
                  aria-label={`Tirar a linha ${n + 1}`}
                  title="Tirar da lista"
                >
                  <IconeLixo />
                </button>
              </div>
              {l.aviso && <p className="mt-2 ml-7.5 text-xs font-bold text-tinta-suave">{l.aviso}</p>}
              <div className="mt-3 grid grid-cols-2 gap-3 sm:ml-7.5 sm:grid-cols-4">
                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor={`${p}-tipo`} className="mb-1 block text-xs font-bold">
                    Tipo
                  </label>
                  <select
                    id={`${p}-tipo`}
                    value={l.tipo}
                    onChange={(e) => mudar(l.uid, { tipo: e.target.value as TipoImportado })}
                    className={campo}
                  >
                    {tiposImportados.map((t) => (
                      <option key={t.valor} value={t.valor}>
                        {t.rotulo}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor={`${p}-data`} className="mb-1 block text-xs font-bold">
                    Dia
                  </label>
                  <input
                    id={`${p}-data`}
                    type="date"
                    value={l.data}
                    onChange={(e) => mudar(l.uid, { data: e.target.value })}
                    className={campo}
                  />
                </div>
                <div>
                  <label htmlFor={`${p}-ate`} className="mb-1 block text-xs font-bold">
                    Até <span className="font-normal text-tinta-suave">(se for período)</span>
                  </label>
                  <input
                    id={`${p}-ate`}
                    type="date"
                    value={l.ate ?? ""}
                    min={l.data}
                    onChange={(e) => mudar(l.uid, { ate: e.target.value || null })}
                    className={campo}
                  />
                </div>
                <div>
                  <label htmlFor={`${p}-hora`} className="mb-1 block text-xs font-bold">
                    Horário <span className="font-normal text-tinta-suave">(opcional)</span>
                  </label>
                  <input
                    id={`${p}-hora`}
                    type="time"
                    value={l.hora ?? ""}
                    onChange={(e) => mudar(l.uid, { hora: e.target.value || null })}
                    className={campo}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {linhas.length < MAX_ITENS && (
        <button type="button" onClick={novaLinha} className={`${botaoSecundario} inline-flex items-center gap-1.5`}>
          <IconeMais />
          Adicionar linha
        </button>
      )}

      <Mensagem estado={estado} />
      <div className="flex flex-wrap items-center gap-3 border-t border-linha pt-4">
        <button type="button" disabled={salvando || marcadas.length === 0} onClick={enviar} className={botaoPrimario}>
          {salvando
            ? "Salvando..."
            : marcadas.length === 0
              ? "Marque o que quer salvar"
              : `Salvar ${marcadas.length} ${marcadas.length === 1 ? "data" : "datas"} ${ondeSalva}`}
        </button>
        <button
          type="button"
          className={botaoTexto}
          disabled={salvando}
          onClick={() => {
            setLinhas(null);
            setEstado(null);
          }}
        >
          Voltar sem salvar
        </button>
      </div>
    </div>
  );
}
