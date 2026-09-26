import type { Ficha } from "./ficha";
import { validarFicha } from "./validar-ficha";

function ficha(parcial: Partial<Ficha> = {}): Ficha {
  return {
    poder: 0,
    habilidade: 0,
    resistencia: 0,
    pericias: [],
    vantagens: [],
    desvantagens: [],
    ...parcial,
  };
}

describe("validarFicha", () => {
  it("aprova uma ficha dentro do pool e calcula PA, PM e PV", () => {
    const resultado = validarFicha(
      ficha({
        poder: 2,
        habilidade: 2,
        resistencia: 2,
        pericias: ["luta", "manha"],
        vantagens: [{ tipo: "forte" }, { tipo: "ataqueEspecial", efeito: "preciso" }],
      }),
    );

    expect(resultado).toEqual({
      ok: true,
      pontosGastos: 10,
      pool: 10,
      pa: 2,
      pm: 10,
      pv: 10,
    });
  });

  it("recusa Ágil com Atrapalhado", () => {
    const resultado = validarFicha(
      ficha({
        vantagens: [{ tipo: "agil" }],
        desvantagens: [{ tipo: "atrapalhado" }],
      }),
    );

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.motivos).toContain(
        "Ágil e Atrapalhado não podem estar na mesma ficha.",
      );
    }
  });

  it("recusa gasto acima de 10 pontos sem desvantagem", () => {
    const resultado = validarFicha(
      ficha({ poder: 5, habilidade: 5, resistencia: 1 }),
    );

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.motivos).toContain("A ficha gasta 11 pontos e o pool é 10.");
    }
  });

  it("aceita um ponto extra quando há duas desvantagens", () => {
    const resultado = validarFicha(
      ficha({
        poder: 5,
        habilidade: 5,
        resistencia: 1,
        desvantagens: [{ tipo: "infame" }, { tipo: "codigo", codigo: "herois" }],
      }),
    );

    expect(resultado).toMatchObject({ ok: true, pontosGastos: 11, pool: 12 });
  });

  it("recusa uma terceira desvantagem", () => {
    const resultado = validarFicha(
      ficha({
        desvantagens: [
          { tipo: "infame" },
          { tipo: "antipatico" },
          { tipo: "codigo", codigo: "combate" },
        ],
      }),
    );

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.motivos).toContain(
        "Desvantagens concedem no máximo 2 pontos.",
      );
    }
  });

  it("recusa atributo acima de 5", () => {
    const resultado = validarFicha(ficha({ poder: 6 }));

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.motivos).toContain("Poder deve ser um inteiro de 0 a 5.");
    }
  });

  it("recusa Maestria sem a perícia escolhida", () => {
    const resultado = validarFicha(
      ficha({
        vantagens: [{ tipo: "maestria", pericia: "luta" }],
      }),
    );

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.motivos).toContain("Maestria exige a perícia escolhida.");
    }
  });
});
