import { describe, expect, it } from "vitest";
import * as React from "react";

// O vitest daqui não injeta o React no JSX dos ícones; carrega o módulo depois de expor o React.
(globalThis as { React?: typeof React }).React = React;
const { abaAtiva, abasAluno, maisAluno } = await import("./navegacao");

describe("menu do aluno", () => {
  it("tem Cursos no topo e não tem Matérias, Resumos, Mapas nem Repasar", () => {
    const hrefs = [...abasAluno, ...maisAluno(true)].map((a) => a.href);
    expect(hrefs).toContain("/aluno/cursos");
    expect(hrefs).not.toContain("/aluno/materias");
    expect(hrefs).not.toContain("/aluno/resumos");
    expect(hrefs).not.toContain("/aluno/mapas");
    expect(hrefs).not.toContain("/aluno/revisar");
  });

  it("acende Atividades no Repasar e Cursos nas matérias, resumos e mapas", () => {
    expect(abaAtiva("/aluno/revisar", "/aluno/atividades")).toBe(true);
    expect(abaAtiva("/aluno/cursos/abc", "/aluno/cursos")).toBe(true);
    expect(abaAtiva("/aluno/materias/abc", "/aluno/cursos")).toBe(true);
    expect(abaAtiva("/aluno/resumos/abc", "/aluno/cursos")).toBe(true);
    expect(abaAtiva("/aluno/mapas", "/aluno/cursos")).toBe(true);
    expect(abaAtiva("/aluno/revisar", "/aluno/cursos")).toBe(false);
    expect(abaAtiva("/aluno/cursos", "/aluno")).toBe(false);
  });
});
