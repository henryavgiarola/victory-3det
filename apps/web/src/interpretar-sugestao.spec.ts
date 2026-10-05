import { describe, expect, it } from "@jest/globals";
import { interpretarSugestao } from "./interpretar-sugestao";

const LEGAL = {
  poder: 2,
  habilidade: 2,
  resistencia: 2,
  pericias: ["luta", "manha"],
  vantagens: [{ tipo: "forte" }, { tipo: "ataqueEspecial", efeito: "preciso" }],
  desvantagens: [],
};

describe("interpretarSugestao", () => {
  it("devolve a ficha quando a leitura e a regra aceitam", () => {
    const resultado = interpretarSugestao(LEGAL);
    expect(resultado.ficha).toEqual(LEGAL);
    expect(resultado.motivos).toEqual([]);
  });

  it("devolve a ficha e o motivo da regra quando o par é incompatível", () => {
    const resultado = interpretarSugestao({
      poder: 1,
      habilidade: 2,
      resistencia: 2,
      pericias: [],
      vantagens: [{ tipo: "agil" }],
      desvantagens: [{ tipo: "atrapalhado" }],
    });
    expect(resultado.ficha?.vantagens).toEqual([{ tipo: "agil" }]);
    expect(resultado.motivos).toContain("Ágil e Atrapalhado não podem estar na mesma ficha.");
  });

  it("não monta ficha quando o código não existe", () => {
    const resultado = interpretarSugestao({ ...LEGAL, pericias: ["voo"] });
    expect(resultado.ficha).toBeNull();
    expect(resultado.motivos).toEqual(["Perícia desconhecida na leitura: voo."]);
  });

  it("não monta ficha quando há campo a mais", () => {
    const resultado = interpretarSugestao({ ...LEGAL, nome: "Mira" });
    expect(resultado.ficha).toBeNull();
    expect(resultado.motivos).toEqual(["Campo fora da ficha: nome."]);
  });

  it("não monta ficha quando a entrada não é objeto", () => {
    expect(interpretarSugestao("texto").ficha).toBeNull();
    expect(interpretarSugestao(null).motivos).toEqual(["A sugestão não é um objeto."]);
  });
});
