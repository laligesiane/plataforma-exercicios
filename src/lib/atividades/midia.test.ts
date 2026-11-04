import { describe, expect, it } from "vitest";
import { ehMidia, enderecoDoVideo } from "./midia";
import { configDoExercicio, ehExercicio, limparExercicio, novoExercicio, problemasDaAtividade } from "./modelo";

describe("enderecoDoVideo", () => {
  it.each([
    ["https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10s", "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"],
    ["https://youtu.be/dQw4w9WgXcQ?si=abc", "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"],
    ["https://m.youtube.com/shorts/dQw4w9WgXcQ", "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"],
    ["https://www.youtube.com/embed/dQw4w9WgXcQ", "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"],
    ["https://vimeo.com/76979871", "https://player.vimeo.com/video/76979871"],
    ["https://player.vimeo.com/video/76979871?h=x", "https://player.vimeo.com/video/76979871"],
  ])("%s", (link, esperado) => {
    expect(enderecoDoVideo(link)).toBe(esperado);
  });

  it.each(["https://example.com/video.mp4", "javascript:alert(1)", "não é link", "https://youtube.com/watch?v=curto"])(
    "recusa %s",
    (link) => {
      expect(enderecoDoVideo(link)).toBeNull();
    },
  );
});

describe("ehMidia", () => {
  it("aceita imagem e áudio https e vídeo do YouTube", () => {
    expect(ehMidia({ tipo: "imagem", url: "https://x.supabase.co/a.png" })).toBe(true);
    expect(ehMidia({ tipo: "audio", url: "https://x.supabase.co/a.mp3", legenda: "Ouça" })).toBe(true);
    expect(ehMidia({ tipo: "video", url: "https://youtu.be/dQw4w9WgXcQ" })).toBe(true);
  });

  it("recusa http, vídeo de outro site e tipo desconhecido", () => {
    expect(ehMidia({ tipo: "imagem", url: "http://x.com/a.png" })).toBe(false);
    expect(ehMidia({ tipo: "video", url: "https://example.com/v" })).toBe(false);
    expect(ehMidia({ tipo: "pdf", url: "https://x.com/a.pdf" })).toBe(false);
    expect(ehMidia({ tipo: "audio", url: "https://x.com/a.mp3", legenda: 3 })).toBe(false);
  });
});

describe("mídia no exercício", () => {
  it("vai para o config, some quando o link está vazio e bloqueia publicar com link ruim", () => {
    const base = novoExercicio("relacionar");
    const comVideo = { ...base, midia: { tipo: "video" as const, url: " https://youtu.be/dQw4w9WgXcQ ", legenda: " " } };
    const limpo = limparExercicio(comVideo);
    expect(limpo.midia).toEqual({ tipo: "video", url: "https://youtu.be/dQw4w9WgXcQ" });
    expect(configDoExercicio(limpo)).toEqual({ midia: limpo.midia });
    expect(limparExercicio({ ...base, midia: { tipo: "imagem", url: "  " } }).midia).toBeUndefined();

    const ruim = limparExercicio({ ...base, midia: { tipo: "video", url: "https://example.com/v" } });
    expect(problemasDaAtividade("T", [ruim])).toContain("Exercício 1: o vídeo precisa ser um link do YouTube ou do Vimeo.");
  });

  it("ehExercicio aceita rascunho com mídia e recusa forma errada ou imagem de cartão sem https", () => {
    const base = novoExercicio("classificar");
    expect(ehExercicio({ ...base, midia: { tipo: "audio", url: "" } })).toBe(true);
    expect(ehExercicio({ ...base, midia: { tipo: "pdf", url: "" } })).toBe(false);
    const cartao = { ...base.itens[0], imagem: "javascript:alert(1)" };
    expect(ehExercicio({ ...base, itens: [cartao] })).toBe(false);
    expect(ehExercicio({ ...base, itens: [{ ...cartao, imagem: "https://x.co/a.png" }] })).toBe(true);
  });
});
