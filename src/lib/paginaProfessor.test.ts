import { describe, expect, it } from "vitest";
import { fotoValida } from "./foto";
import { formatarTelefone, infoRedes, lerContato, normalizarApelido, normalizarRede, problemaDaRede, problemaDoApelido, tempoEnsinando } from "./paginaProfessor";

describe("página do professor", () => {
  it("normaliza o apelido", () => {
    expect(normalizarApelido("  Ana Lúcia  Prof. ")).toBe("ana-lucia-prof");
    expect(normalizarApelido("--Já!--")).toBe("ja");
  });
  it("valida como o banco", () => {
    expect(problemaDoApelido("ana-lucia")).toBeNull();
    expect(problemaDoApelido("ab")).not.toBeNull();
    expect(problemaDoApelido("ana-")).not.toBeNull();
    expect(problemaDoApelido("admin")).not.toBeNull();
  });
  it("só cria link para e-mail ou https", () => {
    expect(lerContato("ana@x.com")?.href).toBe("mailto:ana@x.com");
    expect(lerContato("https://ana.com.br")).toEqual({ texto: "ana.com.br", href: "https://ana.com.br" });
    expect(lerContato("javascript:alert(1)")?.href).toBeUndefined();
    expect(lerContato("  ")).toBeNull();
  });
});

describe("redes sociais da página", () => {
  it("monta o WhatsApp com o 55 do Brasil", () => {
    expect(normalizarRede("whatsapp", "(11) 91234-5678")).toBe("5511912345678");
    expect(normalizarRede("whatsapp", "+55 11 91234-5678")).toBe("5511912345678");
    expect(normalizarRede("whatsapp", "https://wa.me/5511912345678")).toBe("5511912345678");
    expect(infoRedes.whatsapp.link("5511912345678")).toBe("https://wa.me/5511912345678");
    expect(formatarTelefone("5511912345678")).toBe("(11) 91234-5678");
    expect(problemaDaRede("whatsapp", normalizarRede("whatsapp", "1234"))).not.toBeNull();
  });
  it("aceita @usuario ou o link colado", () => {
    expect(normalizarRede("instagram", "@ana.prof")).toBe("ana.prof");
    expect(normalizarRede("instagram", "https://www.instagram.com/ana.prof/?hl=pt")).toBe("ana.prof");
    expect(normalizarRede("tiktok", "tiktok.com/@ana_prof")).toBe("ana_prof");
    expect(normalizarRede("youtube", "https://youtube.com/@AnaEnsina")).toBe("AnaEnsina");
    expect(normalizarRede("facebook", "https://m.facebook.com/ana.prof.oficial")).toBe("ana.prof.oficial");
  });
  it("monta os links certos", () => {
    expect(infoRedes.instagram.link("ana.prof")).toBe("https://www.instagram.com/ana.prof");
    expect(infoRedes.tiktok.link("ana_prof")).toBe("https://www.tiktok.com/@ana_prof");
    expect(infoRedes.youtube.link("AnaEnsina")).toBe("https://www.youtube.com/@AnaEnsina");
    expect(infoRedes.facebook.link("ana.prof.oficial")).toBe("https://www.facebook.com/ana.prof.oficial");
  });
  it("recusa o que o banco recusaria", () => {
    expect(problemaDaRede("instagram", "ana prof")).not.toBeNull();
    expect(problemaDaRede("instagram", "javascript:alert(1)")).not.toBeNull();
    expect(problemaDaRede("facebook", "ana")).not.toBeNull();
    expect(problemaDaRede("tiktok", "")).toBeNull();
  });
  it("conta há quanto tempo ensina", () => {
    expect(tempoEnsinando(2018, 2026)).toBe("Ensina há 8 anos");
    expect(tempoEnsinando(2025, 2026)).toBe("Ensina há 1 ano");
    expect(tempoEnsinando(2026, 2026)).toBe("Ensina desde 2026");
    expect(tempoEnsinando(null, 2026)).toBeNull();
  });
});

describe("foto de perfil", () => {
  const id = "0b1c2d3e-4f50-6172-8394-a5b6c7d8e9f0";
  it("só aceita a foto na pasta da própria pessoa", () => {
    expect(fotoValida(`${id}/abc-123.webp`, id)).toBe(true);
    expect(fotoValida(`${id}/../x.webp`, id)).toBe(false);
    expect(fotoValida(`ffffffff-4f50-6172-8394-a5b6c7d8e9f0/a.webp`, id)).toBe(false);
    expect(fotoValida(`${id}/a.svg`, id)).toBe(false);
  });
});
