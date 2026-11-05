import { describe, expect, it } from "vitest";
import { melhorVoz, nomeAmigavel, opcoesDeVoz, partesDaFala, trechosDoDocumento, type VozDoAparelho } from ".";
import type { Documento } from "@/lib/documento";

const voz = (name: string, lang: string, extra: Partial<VozDoAparelho> = {}): VozDoAparelho => ({
  name,
  lang,
  voiceURI: name,
  ...extra,
});

describe("trechosDoDocumento", () => {
  it("separa títulos, parágrafos e itens de lista, na ordem", () => {
    const doc: Documento = {
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Verbos" }] },
        { type: "paragraph", content: [{ type: "text", text: "Ser e " }, { type: "text", text: "estar", marks: [{ type: "bold" }] }] },
        { type: "paragraph" },
        {
          type: "bulletList",
          content: [
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "um" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "dois" }] }] },
          ],
        },
        { type: "blockquote", content: [{ type: "paragraph", content: [{ type: "text", text: "nota" }] }] },
        { type: "horizontalRule" },
      ],
    };
    expect(trechosDoDocumento(doc)).toEqual(["Verbos", "Ser e estar", "um", "dois", "nota"]);
  });
});

describe("partesDaFala", () => {
  it("mantém um texto curto inteiro", () => {
    expect(partesDaFala("Olá. Tudo bem?")).toEqual(["Olá. Tudo bem?"]);
  });

  it("divide texto longo por frase, sem passar do limite", () => {
    const texto = Array.from({ length: 12 }, (_, i) => `Esta é a frase número ${i + 1} do resumo.`).join(" ");
    const partes = partesDaFala(texto, 100);
    expect(partes.length).toBeGreaterThan(1);
    for (const p of partes) expect(p.length).toBeLessThanOrEqual(100);
    expect(partes.join(" ")).toBe(texto);
  });

  it("corta uma frase gigante sem pontuação nos espaços", () => {
    const texto = Array.from({ length: 80 }, () => "palavra").join(" ");
    const partes = partesDaFala(texto, 60);
    for (const p of partes) expect(p.length).toBeLessThanOrEqual(60);
    expect(partes.join(" ")).toBe(texto);
  });
});

describe("opcoesDeVoz", () => {
  it("lista as vozes do idioma, as do Brasil e as naturais primeiro", () => {
    const opcoes = opcoesDeVoz([
      voz("Microsoft Duarte - Portuguese (Portugal)", "pt-PT"),
      voz("English", "en-US"),
      voz("Microsoft Francisca Online (Natural) - Portuguese (Brazil)", "pt-BR"),
      voz("Luciana", "pt-BR"),
    ]);
    expect(opcoes.map((o) => o.rotulo)).toEqual(["Francisca", "Luciana", "Duarte"]);
    expect(opcoes[2].detalhe).toBe("Portugal");
  });

  it("aceita o idioma escrito com sublinhado (Android)", () => {
    const opcoes = opcoesDeVoz([voz("a", "pt_BR"), voz("b", "pt_BR")]);
    expect(opcoes).toHaveLength(2);
  });

  it("não repete a mesma voz", () => {
    const opcoes = opcoesDeVoz([
      voz("Microsoft Antonio Online (Natural) - Portuguese (Brazil)", "pt-BR"),
      voz("Microsoft Antonio - Portuguese (Brazil)", "pt-BR", { voiceURI: "local" }),
      voz("Luciana", "pt-BR"),
    ]);
    expect(opcoes.map((o) => o.rotulo)).toEqual(["Antonio", "Luciana"]);
  });

  it("com uma voz só, oferece a mesma voz em tons diferentes", () => {
    const opcoes = opcoesDeVoz([voz("Luciana", "pt-BR"), voz("Samantha", "en-US")]);
    expect(opcoes).toHaveLength(3);
    expect(new Set(opcoes.map((o) => o.tom)).size).toBe(3);
    expect(opcoes.every((o) => o.voiceURI === "Luciana")).toBe(true);
  });

  it("sem nenhuma voz listada, ainda oferece pelo menos duas opções", () => {
    const opcoes = opcoesDeVoz([]);
    expect(opcoes.length).toBeGreaterThanOrEqual(2);
    expect(opcoes[0].voiceURI).toBeUndefined();
  });
});

describe("nomeAmigavel", () => {
  it("tira fabricante e descrição", () => {
    expect(nomeAmigavel(voz("Google português do Brasil", "pt-BR"))).toBe("português do Brasil");
    expect(nomeAmigavel(voz("Microsoft Maria - Portuguese (Brazil)", "pt-BR"))).toBe("Maria");
  });
});

describe("melhorVoz", () => {
  it("prefere a voz neural e deixa a robótica por último", () => {
    const vozes = [
      voz("eSpeak Spanish", "es"),
      voz("Microsoft Helena - Spanish (Spain)", "es-ES"),
      voz("Microsoft Elvira Online (Natural) - Spanish (Spain)", "es-ES", { localService: false }),
    ];
    expect(melhorVoz(vozes, "es-ES")?.name).toContain("Elvira");
  });

  it("sem voz no idioma, não escolhe nenhuma", () => {
    expect(melhorVoz([voz("Samantha", "en-US")], "pt-BR")).toBeUndefined();
  });
});
