import { describe, expect, it } from "vitest";
import { lerFiltros, limparTermo, linkBiblioteca, opcoesDeMateria } from "./biblioteca";
import { etiquetasDaAtividade, normalizarTemas } from "./modelo";

describe("normalizarTemas", () => {
  it("separa por vírgula, deixa em minúsculas e não repete", () => {
    expect(normalizarTemas("Frações, Porcentagem,  frações ,, #Equações")).toEqual(["frações", "porcentagem", "equações"]);
  });

  it("guarda no máximo 8 temas", () => {
    expect(normalizarTemas("a,b,c,d,e,f,g,h,i,j")).toHaveLength(8);
  });
});

describe("lerFiltros", () => {
  it("entende matéria, etapa e tema", () => {
    const f = lerFiltros({ q: " Frações ", materia: "Matemática", nivel: "fundamental_2", tema: "Frações" });
    expect(f.busca).toBe("Frações");
    expect(f.materia).toEqual({ tipo: "materia", nome: "Matemática", valor: "Matemática" });
    expect(f.nivel).toEqual({ tipo: "etapa", etapa: "fundamental_2", valor: "fundamental_2" });
    expect(f.tema).toBe("frações");
  });

  it("entende idioma e nível A1 a C2, inclusive o link antigo ?idioma=", () => {
    expect(lerFiltros({ materia: "idioma:en", nivel: "B1" })).toMatchObject({
      materia: { tipo: "idioma", codigo: "en" },
      nivel: { tipo: "qecr", nivel: "B1" },
    });
    expect(lerFiltros({ idioma: "es" }).materia).toMatchObject({ tipo: "idioma", codigo: "es" });
  });

  it("ignora valores inválidos", () => {
    expect(lerFiltros({ materia: "idioma:xx", nivel: "Z9" })).toMatchObject({ materia: null, nivel: null });
  });

  it("não deixa a busca virar comando do filtro", () => {
    expect(limparTermo("a,b(c)%_*{d}")).toBe("a b c d");
  });
});

describe("opcoesDeMateria", () => {
  it("lista matérias sem repetir e idiomas das atividades de idioma", () => {
    const opcoes = opcoesDeMateria([
      { materia: "Matemática", idioma_ensinado: null },
      { materia: "matemática ", idioma_ensinado: null },
      { materia: "Biologia", idioma_ensinado: null },
      { materia: "", idioma_ensinado: "en" },
      { materia: "", idioma_ensinado: "es" },
    ]);
    expect(opcoes.materias).toEqual(["Biologia", "Matemática"]);
    expect(opcoes.idiomas).toEqual([
      { valor: "idioma:es", nome: "Espanhol" },
      { valor: "idioma:en", nome: "Inglês" },
    ]);
  });
});

describe("linkBiblioteca", () => {
  it("deixa de fora os filtros vazios", () => {
    expect(linkBiblioteca({ materia: "Matemática", nivel: "", tema: "frações" })).toBe("/biblioteca?materia=Matem%C3%A1tica&tema=fra%C3%A7%C3%B5es");
    expect(linkBiblioteca({})).toBe("/biblioteca");
  });
});

describe("etiquetas com etapa", () => {
  it("mostra a etapa depois da matéria ou do idioma", () => {
    expect(etiquetasDaAtividade({ materia: "Biologia", nivel: "A1", categoria: "gramatica", etapa: "medio" })).toEqual(["Biologia", "Ensino Médio"]);
    expect(etiquetasDaAtividade({ materia: "", nivel: "B1", categoria: "vocabulario", idioma_ensinado: "en", etapa: "" })).toEqual([
      "B1",
      "Vocabulário",
      "Inglês",
    ]);
  });
});
