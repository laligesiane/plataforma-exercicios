"use client";

import { useRef, useState, useTransition } from "react";
import { Avatar } from "@/components/Avatar";
import { botaoSecundario, botaoTexto } from "@/components/ui/estilos";
import { BUCKET_FOTO, urlDaFoto } from "@/lib/foto";
import { criarClienteNavegador } from "@/lib/supabase/navegador";
import { removerFoto, salvarFoto } from "./actions-foto";

const LADO = 400;
const ACEITOS = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"];

/** Recorta o centro da imagem num quadrado de 400x400 e devolve WebP (ou JPEG, se o navegador não gerar WebP). */
async function prepararFoto(arquivo: File): Promise<Blob> {
  const imagem = await createImageBitmap(arquivo);
  const lado = Math.min(imagem.width, imagem.height);
  const tela = document.createElement("canvas");
  tela.width = tela.height = LADO;
  const ctx = tela.getContext("2d");
  if (!ctx) throw new Error("sem canvas");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(imagem, (imagem.width - lado) / 2, (imagem.height - lado) / 2, lado, lado, 0, 0, LADO, LADO);
  imagem.close();
  const gerar = (tipo: string) => new Promise<Blob | null>((ok) => tela.toBlob(ok, tipo, 0.85));
  const webp = await gerar("image/webp");
  if (webp?.type === "image/webp") return webp;
  const jpeg = await gerar("image/jpeg");
  if (!jpeg) throw new Error("sem imagem");
  return jpeg;
}

/** Foto de perfil: escolher, enviar já reduzida para o Storage e salvar no perfil. */
export function FotoPerfil({ nome, foto }: { nome: string | null; foto: string | null }) {
  const [atual, setAtual] = useState(foto);
  const [aviso, setAviso] = useState<{ erro?: string; ok?: string }>({});
  const [enviando, iniciar] = useTransition();
  const entrada = useRef<HTMLInputElement>(null);

  function escolher(arquivo: File | undefined) {
    if (!arquivo) return;
    setAviso({});
    if (arquivo.type && !ACEITOS.includes(arquivo.type)) return setAviso({ erro: "Use uma foto JPG, PNG ou WebP." });
    if (arquivo.size > 20 * 1024 * 1024) return setAviso({ erro: "A foto passa de 20 MB. Escolha uma menor." });

    iniciar(async () => {
      let foto: Blob;
      try {
        foto = await prepararFoto(arquivo);
      } catch {
        return setAviso({ erro: "Não conseguimos abrir essa imagem. Tente uma foto JPG ou PNG." });
      }
      const supabase = criarClienteNavegador();
      const { data } = await supabase.auth.getUser();
      if (!data.user) return setAviso({ erro: "Sua sessão expirou. Entre de novo para trocar a foto." });

      const caminho = `${data.user.id}/${crypto.randomUUID()}.${foto.type === "image/webp" ? "webp" : "jpg"}`;
      const { error } = await supabase.storage.from(BUCKET_FOTO).upload(caminho, foto, { contentType: foto.type, cacheControl: "31536000", upsert: false });
      if (error) return setAviso({ erro: "Não deu para enviar a foto. Confira sua conexão e tente de novo." });

      const r = await salvarFoto(caminho);
      if (r.erro) return setAviso({ erro: r.erro });
      setAtual(caminho);
      setAviso({ ok: "Foto salva." });
    });
  }

  function remover() {
    setAviso({});
    iniciar(async () => {
      const r = await removerFoto();
      if (r.erro) return setAviso({ erro: r.erro });
      setAtual(null);
      setAviso({ ok: "Foto removida." });
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Avatar nome={nome} foto={urlDaFoto(atual)} className="size-20 text-3xl" />
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => entrada.current?.click()} disabled={enviando} className={`${botaoSecundario} inline-flex items-center gap-2`}>
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M4 8a2 2 0 0 1 2-2h1.5l1.5-2h6l1.5 2H18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
              <circle cx="12" cy="13" r="3.5" />
            </svg>
            {enviando ? "Salvando..." : atual ? "Trocar foto" : "Colocar foto"}
          </button>
          {atual && !enviando && (
            <button type="button" onClick={remover} className={botaoTexto}>
              Remover
            </button>
          )}
        </div>
        <p className="text-xs text-tinta-suave">Aparece no menu e, se você é professor, na sua página pública.</p>
        {aviso.erro && <p role="alert" className="text-sm text-erro">{aviso.erro}</p>}
        {aviso.ok && <p role="status" className="text-sm text-certo">{aviso.ok}</p>}
      </div>
      <input
        ref={entrada}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif"
        className="hidden"
        onChange={(e) => {
          escolher(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
