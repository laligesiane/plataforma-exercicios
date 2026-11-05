import { describe, expect, it } from "vitest";
import * as React from "react";

// O vitest daqui não injeta o React no JSX dos ícones; carrega o módulo depois de expor o React.
(globalThis as { React?: typeof React }).React = React;
const { abaAtiva, abasAluno, maisAluno } = await import("./navegacao");

describe("menu do aluno", () => {
  it("tem Matérias no topo e não tem Resumos, Mapas nem Repasar", () => {
    const hrefs = [...abasAluno, ...maisAluno(true)].map((a) => a.href);
    expect(hrefs).toContain("/aluno/materias");
    expect(hrefs).not.toContain("/aluno/resumos");
    expect(hrefs).not.toContain("/aluno/mapas");
    expect(hrefs).not.toContain("/aluno/revisar");
  });

  it("acende Atividades no Repasar e Matérias nos resumos e mapas", () => {
    expect(abaAtiva("/aluno/revisar", "/aluno/atividades")).toBe(true);
    expect(abaAtiva("/aluno/resumos/abc", "/aluno/materias")).toBe(true);
    expect(abaAtiva("/aluno/mapas", "/aluno/materias")).toBe(true);
    expect(abaAtiva("/aluno/revisar", "/aluno/materias")).toBe(false);
    expect(abaAtiva("/aluno/materias", "/aluno")).toBe(false);
  });
});
