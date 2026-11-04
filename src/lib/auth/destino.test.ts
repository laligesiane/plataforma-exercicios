import { describe, expect, it } from "vitest";
import { caminhoInterno, liberadaSemSegundaEtapa } from "./destino";

describe("caminhoInterno", () => {
  it("aceita caminhos do próprio site", () => {
    expect(caminhoInterno("/professor")).toBe("/professor");
    expect(caminhoInterno("/atividades/1?x=2")).toBe("/atividades/1?x=2");
  });
  it("recusa outros sites e vazios", () => {
    expect(caminhoInterno("//mal.com")).toBeNull();
    expect(caminhoInterno("/\\mal.com")).toBeNull();
    expect(caminhoInterno("https://mal.com")).toBeNull();
    expect(caminhoInterno("")).toBeNull();
    expect(caminhoInterno(null)).toBeNull();
  });
});

describe("liberadaSemSegundaEtapa", () => {
  it("libera só a verificação e os retornos de e-mail", () => {
    expect(liberadaSemSegundaEtapa("/entrar/verificar")).toBe(true);
    expect(liberadaSemSegundaEtapa("/auth/confirmar")).toBe(true);
    expect(liberadaSemSegundaEtapa("/professor")).toBe(false);
    expect(liberadaSemSegundaEtapa("/perfil")).toBe(false);
    expect(liberadaSemSegundaEtapa("/")).toBe(false);
  });
});
