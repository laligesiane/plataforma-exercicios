import { describe, expect, it } from "vitest";
import { fmt, idiomaDoNavegador } from "./config";
import { dicionarios } from "./dicionarios";

describe("idioma do navegador", () => {
  it("segue a ordem de preferência", () => {
    expect(idiomaDoNavegador("es-AR,es;q=0.9,en;q=0.8")).toBe("es");
    expect(idiomaDoNavegador("en-US,en;q=0.9")).toBe("en");
    expect(idiomaDoNavegador("fr-FR,fr;q=0.9,en;q=0.5,es;q=0.7")).toBe("es");
    expect(idiomaDoNavegador("pt-BR")).toBe("pt");
  });
  it("sem idioma conhecido fica o português", () => {
    expect(idiomaDoNavegador(null)).toBe("pt");
    expect(idiomaDoNavegador("de-DE,ja;q=0.5")).toBe("pt");
    expect(idiomaDoNavegador("en;q=0")).toBe("pt");
  });
});

describe("dicionários", () => {
  it("troca as variáveis", () => {
    expect(fmt("Olá, {nome}! {x}", { nome: "Ana" })).toBe("Olá, Ana! {x}");
  });

  // O TypeScript já cobra as chaves; aqui confere que nenhum texto ficou vazio e que as variáveis batem.
  it("todos os idiomas têm os mesmos textos e variáveis", () => {
    const variaveis = (t: string) => (t.match(/\{\w+\}/g) ?? []).sort().join();
    const andar = (pt: object, outro: object, caminho: string) => {
      for (const [k, v] of Object.entries(pt)) {
        const o = (outro as Record<string, unknown>)[k];
        if (typeof v === "string") {
          expect(typeof o, `${caminho}${k}`).toBe("string");
          expect((o as string).trim(), `${caminho}${k}`).not.toBe("");
          expect(variaveis(o as string), `${caminho}${k}`).toBe(variaveis(v));
        } else andar(v, o as object, `${caminho}${k}.`);
      }
    };
    andar(dicionarios.pt, dicionarios.es, "es.");
    andar(dicionarios.pt, dicionarios.en, "en.");
  });
});
