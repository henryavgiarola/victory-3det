import { describe, expect, it } from "@jest/globals";
import { PERICIAS } from "@victory/rules";
import { SugestaoIndisponivel, responderSugestao, sugerirFicha } from "./sugerir-ficha";

const LEGAL = {
  poder: 2,
  habilidade: 2,
  resistencia: 2,
  pericias: ["luta", "manha"],
  vantagens: [{ tipo: "forte" }, { tipo: "ataqueEspecial", efeito: "preciso" }],
  desvantagens: [],
};

const ILEGAL = {
  poder: 1,
  habilidade: 2,
  resistencia: 2,
  pericias: [],
  vantagens: [{ tipo: "agil" }],
  desvantagens: [{ tipo: "atrapalhado" }],
};

const CODIGOS = ["agil", "anulacao", "alcance", "ataqueEspecial", "carismatico", "defesaEspecial", "forte", "genio", "maestria", "resoluto", "vigoroso", "antipatico", "atrapalhado", "codigo", "fracote", "fragil", "indeciso", "infame", "tapado", "espiritual", "potente", "penetrante", "perigoso", "preciso", "esquiva", "reflexao", "robusta", "tenaz", "cacador", "combate", "derrota", "herois"];

describe("sugerirFicha", () => {
  it("aceita a primeira resposta quando a regra aceita", async () => {
    const pedidos: string[] = [];
    const resultado = await sugerirFicha("uma lutadora", async (pedido) => {
      pedidos.push(pedido);
      return LEGAL;
    });
    expect(pedidos).toHaveLength(1);
    for (const codigo of [...PERICIAS, ...CODIGOS]) {
      expect(pedidos[0]).toContain(codigo);
    }
    expect(resultado.ficha).toEqual(LEGAL);
    expect(resultado.motivos).toEqual([]);
  });

  it("faz uma segunda chamada com os motivos e não faz uma terceira", async () => {
    const pedidos: string[] = [];
    const resultado = await sugerirFicha("uma lutadora", async (pedido) => {
      pedidos.push(pedido);
      return pedidos.length === 1 ? ILEGAL : LEGAL;
    });
    expect(pedidos).toHaveLength(2);
    expect(pedidos[1]).toContain("Ágil e Atrapalhado não podem estar na mesma ficha.");
    expect(resultado.ficha).toEqual(LEGAL);
    expect(resultado.motivos).toEqual([]);
  });

  it("devolve a segunda leitura quando ela continua sem ficha", async () => {
    let chamadas = 0;
    const resultado = await sugerirFicha("uma lutadora", async () => {
      chamadas += 1;
      return { pericias: ["voo"] };
    });
    expect(chamadas).toBe(2);
    expect(resultado.ficha).toBeNull();
    expect(resultado.motivos.length).toBeGreaterThan(0);
  });
});

describe("responderSugestao", () => {
  it("nega sem sessão e não chama o modelo", async () => {
    let chamadas = 0;
    const resposta = await responderSugestao(false, { descricao: "uma lutadora" }, async () => {
      chamadas += 1;
      return LEGAL;
    });
    expect(resposta.status).toBe(401);
    expect(chamadas).toBe(0);
  });

  it("recusa descrição vazia ou acima do teto", async () => {
    expect((await responderSugestao(true, { descricao: "  " }, async () => LEGAL)).status).toBe(400);
    expect((await responderSugestao(true, { descricao: "a".repeat(2001) }, async () => LEGAL)).status).toBe(400);
  });

  it("devolve a ficha e os motivos da regra", async () => {
    const resposta = await responderSugestao(true, { descricao: "uma lutadora" }, async () => ILEGAL);
    expect(resposta.status).toBe(200);
    expect(resposta.corpo).toMatchObject({
      ficha: ILEGAL,
      motivos: ["Ágil e Atrapalhado não podem estar na mesma ficha."],
    });
  });

  it("devolve os motivos de leitura quando não há ficha", async () => {
    const resposta = await responderSugestao(true, { descricao: "uma lutadora" }, async () => ({ pericias: ["voo"] }));
    expect(resposta.status).toBe(422);
    expect(resposta.corpo).toEqual({ motivos: expect.arrayContaining([expect.stringContaining("voo")]) });
  });

  it("responde 502 quando o modelo não responde", async () => {
    const resposta = await responderSugestao(true, { descricao: "uma lutadora" }, async () => {
      throw new SugestaoIndisponivel();
    });
    expect(resposta).toEqual({ status: 502, corpo: { mensagem: "A sugestão não está disponível." } });
  });
});
