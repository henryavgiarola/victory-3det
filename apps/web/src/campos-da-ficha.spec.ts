import { describe, expect, it } from "@jest/globals";
import type { Ficha } from "@victory/rules";
import { camposDaFicha } from "./campos-da-ficha";

const VAZIA: Ficha = {
  poder: 0,
  habilidade: 0,
  resistencia: 0,
  pericias: [],
  vantagens: [],
  desvantagens: [],
};

describe("camposDaFicha", () => {
  it("marca os controles que a ficha legal usa", () => {
    const campos = camposDaFicha({
      ...VAZIA,
      poder: 2,
      habilidade: 2,
      resistencia: 2,
      pericias: ["luta", "manha"],
      vantagens: [{ tipo: "forte" }, { tipo: "ataqueEspecial", efeito: "preciso" }],
    });
    expect(campos.poder).toBe(2);
    expect(campos.pericias).toEqual(["luta", "manha"]);
    expect(campos.simples).toEqual(["forte"]);
    expect(campos.ataque).toBe(true);
    expect(campos.efeitoAtaque).toBe("preciso");
    expect(campos.desvantagens).toEqual([]);
  });

  it("marca Ágil e Atrapalhado e deixa o restante desmarcado", () => {
    const campos = camposDaFicha({
      ...VAZIA,
      poder: 1,
      habilidade: 2,
      resistencia: 2,
      vantagens: [{ tipo: "agil" }],
      desvantagens: [{ tipo: "atrapalhado" }],
    });
    expect(campos.simples).toEqual(["agil"]);
    expect(campos.desvantagens).toEqual(["atrapalhado"]);
    expect(campos.ataque).toBe(false);
    expect(campos.codigo).toBe(false);
    expect(campos.efeitoAtaque).toBe("preciso");
  });

  it("fica com o primeiro ataque quando a ficha traz dois", () => {
    const campos = camposDaFicha({
      ...VAZIA,
      vantagens: [
        { tipo: "ataqueEspecial", efeito: "penetrante" },
        { tipo: "ataqueEspecial", efeito: "perigoso" },
      ],
    });
    expect(campos.ataque).toBe(true);
    expect(campos.efeitoAtaque).toBe("penetrante");
  });
});
