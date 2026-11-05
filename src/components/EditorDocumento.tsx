"use client";

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

const botoes: (Botao | "separador")[] = [
  {
    rotulo: "Texto",
    dica: "Texto normal",
    conteudo: "Texto",
    ativo: (e) => e.isActive("paragraph") && !e.isActive("blockquote"),
    acao: (e) => e.chain().focus().setParagraph().run(),
  },
  {
    rotulo: "Título",
    dica: "Título de seção",
    conteudo: <span className="font-extrabold">Título</span>,
    ativo: (e) => e.isActive("heading", { level: 2 }),
    acao: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    rotulo: "Subtítulo",
    dica: "Subtítulo (subseção)",
    conteudo: <span className="font-bold text-primaria">Subtítulo</span>,
    ativo: (e) => e.isActive("heading", { level: 3 }),
    acao: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  "separador",
  {
    rotulo: "Negrito",
    dica: "Negrito (Ctrl+B)",
    conteudo: <span className="font-extrabold">N</span>,
    ativo: (e) => e.isActive("bold"),
    acao: (e) => e.chain().focus().toggleBold().run(),
  },
  {
    rotulo: "Itálico",
    dica: "Itálico (Ctrl+I)",
    conteudo: <span className="font-serif italic">I</span>,
    ativo: (e) => e.isActive("italic"),
    acao: (e) => e.chain().focus().toggleItalic().run(),
  },
  {
    rotulo: "Marca-texto",
    dica: "Marca-texto (Ctrl+Shift+H)",
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
    rotulo: "Lista",
    dica: "Lista com marcadores",
    conteudo: "• Lista",
    ativo: (e) => e.isActive("bulletList"),
    acao: (e) => e.chain().focus().toggleBulletList().run(),
  },
  {
    rotulo: "Lista numerada",
    dica: "Lista numerada",
    conteudo: "1. Lista",
    ativo: (e) => e.isActive("orderedList"),
    acao: (e) => e.chain().focus().toggleOrderedList().run(),
  },
  {
    rotulo: "Nota",
    dica: "Nota em destaque",
    conteudo: "✎ Nota",
    ativo: (e) => e.isActive("blockquote"),
    acao: (e) => e.chain().focus().toggleBlockquote().run(),
  },
  {
    rotulo: "Divisória",
    dica: "Linha para separar partes",
    conteudo: "—",
    ativo: () => false,
    acao: (e) => e.chain().focus().setHorizontalRule().run(),
  },
];

/** Editor simples de página: títulos, negrito, itálico, marca-texto, listas e notas. */
export function EditorDocumento({
  nome,
  inicial,
  placeholder = "Escreva o resumo aqui. Use Título e Subtítulo para separar as partes.",
  aoMudar,
}: {
  nome: string;
  inicial: Documento;
  placeholder?: string;
  aoMudar?: (doc: Documento) => void;
}) {
  const [json, setJson] = useState(() => JSON.stringify(inicial));
  const [, forcarAtualizacao] = useState(0);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, code: false, codeBlock: false, strike: false }),
      Highlight,
      Placeholder.configure({ placeholder, emptyEditorClass: "vazio" }),
    ],
    content: inicial,
    editorProps: { attributes: { "aria-label": "Resumo", class: "px-5 py-4" } },
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
        aria-label="Formatação"
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
