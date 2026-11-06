import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { ehVozNatural, montarSsml, urlDaVoz } from "./natural";
import { assinar, assinaturaValida, assinaturasDaLeitura } from "./servidor";

describe("voz natural", () => {
  it("escapa o texto no SSML", () => {
    const ssml = montarSsml('Água < fogo & "ar"', "pt-BR-FranciscaNeural");
    expect(ssml).toContain("Água &lt; fogo &amp; &quot;ar&quot;");
    expect(ssml).toContain('<voice name="pt-BR-FranciscaNeural">');
    expect(ssml).toContain('xml:lang="pt-BR"');
  });

  it("usa o idioma da voz no SSML", () => {
    expect(montarSsml("Hola", "es-ES-ElviraNeural")).toContain('xml:lang="es-ES"');
  });

  it("só aceita vozes da lista", () => {
    expect(ehVozNatural("pt-BR-AntonioNeural")).toBe(true);
    expect(ehVozNatural("en-US-JennyNeural")).toBe(true);
    expect(ehVozNatural("en-US-QualquerNeural")).toBe(false);
  });

  it("assina cada parte e recusa texto trocado", () => {
    process.env.AZURE_SPEECH_KEY = "chave-de-teste";
    const s = assinar("Fotossíntese.");
    expect(assinaturaValida("Fotossíntese.", s)).toBe(true);
    expect(assinaturaValida("Outro texto.", s)).toBe(false);
    expect(assinaturaValida("Fotossíntese.", "curta")).toBe(false);
    const mapa = assinaturasDaLeitura(["Título", "Uma frase. Outra frase."]);
    expect(Object.keys(mapa)).toEqual(["Título", "Uma frase. Outra frase."]);
  });

  it("monta o endereço do áudio", () => {
    expect(urlDaVoz("Oi & tchau", "pt-BR-DonatoNeural", "abc")).toBe("/api/voz?v=pt-BR-DonatoNeural&t=Oi+%26+tchau&s=abc");
  });
});
