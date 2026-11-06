"use client";

import type { Dicionario } from "@/i18n/dicionarios";
import { useDicionario } from "@/i18n/cliente";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState } from "react";
import type { Documento } from "@/lib/documento";

type Botao = {
  rotulo: string;
  dica: string;
  conteudo: React.ReactNode;
  ativo: (e: Editor) => boolean;
  acao: (e: Editor) => void;
};

/**
 * Liga/desliga a nota no trecho selecionado. Um item de lista precisa começar com
 * um parágrafo, então a nota não cabe dentro dele: nesse caso o trecho sai da lista
 * primeiro e vira uma nota logo abaixo dela.
 */
function alternarNota(e: Editor) {
  if (e.isActive("blockquote")) {
    e.chain().focus().lift("blockquote").run();
    return;
  }
  if (e.can().wrapIn("blockquote")) {
    e.chain().focus().wrapIn("blockquote").run();
    return;
  }
  for (let i = 0; i < 10 && e.isActive("listItem"); i++) {
    if (!e.chain().focus().liftListItem("listItem").run()) break;
  }
  e.chain().focus().wrapIn("blockquote").run();
}

function montarBotoes(t: Dicionario["editorDoc"]): (Botao | "separador")[] {
  return [
  {
    rotulo: t.texto,
    dica: t.textoDica,
    conteudo: t.texto,
    ativo: (e) => e.isActive("paragraph") && !e.isActive("blockquote"),
    acao: (e) => e.chain().focus().setParagraph().run(),
  },
  {
    rotulo: t.titulo,
    dica: t.tituloDica,
    conteudo: <span className="font-extrabold">{t.titulo}</span>,
    ativo: (e) => e.isActive("heading", { level: 2 }),
    acao: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    rotulo: t.subtitulo,
    dica: t.subtituloDica,
    conteudo: <span className="font-bold text-primaria">{t.subtitulo}</span>,
    ativo: (e) => e.isActive("heading", { level: 3 }),
    acao: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  "separador",
  {
    rotulo: t.negrito,
    dica: t.negritoDica,
    conteudo: <span className="font-extrabold">{t.negritoLetra}</span>,
    ativo: (e) => e.isActive("bold"),
    acao: (e) => e.chain().focus().toggleBold().run(),
  },
  {
    rotulo: t.italico,
    dica: t.italicoDica,
    conteudo: <span className="font-serif italic">I</span>,
    ativo: (e) => e.isActive("italic"),
    acao: (e) => e.chain().focus().toggleItalic().run(),
  },
  {
    rotulo: t.marca,
    dica: t.marcaDica,
    conteudo: (
      <span className="rounded px-1" style={{ background: "var(--marca)" }}>
        ab
      </span>
    ),
    ativo: (e) => e.isActive("highlight"),
    acao: (e) => e.chain().focus().toggleHighlight().run(),
  },
  "separador",
  {
    rotulo: t.lista,
    dica: t.listaDica,
    conteudo: `• ${t.lista}`,
    ativo: (e) => e.isActive("bulletList"),
    acao: (e) => e.chain().focus().toggleBulletList().run(),
  },
  {
    rotulo: t.numerada,
    dica: t.numerada,
    conteudo: `1. ${t.lista}`,
    ativo: (e) => e.isActive("orderedList"),
    acao: (e) => e.chain().focus().toggleOrderedList().run(),
  },
  {
    rotulo: t.nota,
    dica: t.notaDica,
    conteudo: (
      <span className="inline-flex items-center gap-1">
        <svg
          viewBox="0 0 24 24"
          className="size-3.5"
          aria-hidden
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
        {t.nota}
      </span>
    ),
    ativo: (e) => e.isActive("blockquote"),
    acao: alternarNota,
  },
  {
    rotulo: t.divisoria,
    dica: t.divisoriaDica,
    conteudo: "—",
    ativo: () => false,
    acao: (e) => e.chain().focus().setHorizontalRule().run(),
  },
  ];
}

/** Editor simples de página: títulos, negrito, itálico, marca-texto, listas e notas. */
export function EditorDocumento({
  nome,
  inicial,
  placeholder,
  aoMudar,
}: {
  nome: string;
  inicial: Documento;
  placeholder?: string;
  aoMudar?: (doc: Documento) => void;
}) {
  const tx = useDicionario().editorDoc;
  const botoes = montarBotoes(tx);
  const [json, setJson] = useState(() => JSON.stringify(inicial));
  const [, forcarAtualizacao] = useState(0);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, code: false, codeBlock: false, strike: false }),
      Highlight,
      Placeholder.configure({ placeholder: placeholder ?? tx.placeholder, emptyEditorClass: "vazio" }),
    ],
    content: inicial,
    editorProps: { attributes: { "aria-label": tx.resumo, class: "px-5 py-4" } },
    onUpdate: ({ editor }) => {
      const doc = editor.getJSON() as Documento;
      setJson(JSON.stringify(doc));
      aoMudar?.(doc);
    },
    onSelectionUpdate: () => forcarAtualizacao((n) => n + 1),
    onTransaction: () => forcarAtualizacao((n) => n + 1),
  });

  return (
    <div className="rounded-2xl border-2 border-linha focus-within:border-primaria">
      <input type="hidden" name={nome} value={json} />
      <div
        role="toolbar"
        aria-label={tx.formatacao}
        className="sticky top-0 z-20 flex flex-wrap items-center gap-1 rounded-t-[14px] border-b border-linha bg-suave px-2 py-1.5 shadow-[0_1px_0_var(--linha)]"
      >
        {botoes.map((b, i) =>
          b === "separador" ? (
            <span key={i} aria-hidden className="mx-1 h-5 w-px bg-linha" />
          ) : (
            <button
              key={b.rotulo}
              type="button"
              title={b.dica}
              aria-label={b.rotulo}
              aria-pressed={editor ? b.ativo(editor) : false}
              disabled={!editor}
              onMouseDown={(ev) => ev.preventDefault()}
              onClick={() => editor && b.acao(editor)}
              className="min-w-8 rounded-lg px-2 py-1 text-sm transition-colors hover:bg-fundo aria-pressed:bg-primaria-suave aria-pressed:text-primaria disabled:opacity-50"
            >
              {b.conteudo}
            </button>
          ),
        )}
      </div>
      <div className="documento rounded-b-[14px] bg-fundo">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
