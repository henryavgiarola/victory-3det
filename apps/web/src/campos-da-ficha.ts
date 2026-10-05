import type { Codigo, Desvantagem, EfeitoAtaque, EfeitoDefesa, Ficha, Pericia, Vantagem } from "@victory/rules";

const VANTAGENS_SIMPLES = new Set(["agil", "anulacao", "carismatico", "forte", "genio", "resoluto", "vigoroso"]);
const DESVANTAGENS_SIMPLES = new Set(["antipatico", "atrapalhado", "fracote", "fragil", "indeciso", "infame", "tapado"]);

export interface CamposFicha {
  poder: number;
  habilidade: number;
  resistencia: number;
  pericias: Pericia[];
  simples: string[];
  ataque: boolean;
  efeitoAtaque: EfeitoAtaque;
  defesa: boolean;
  efeitoDefesa: EfeitoDefesa;
  alcance: boolean;
  pontosAlcance: 1 | 2;
  maestria: boolean;
  periciaMaestria: Pericia;
  desvantagens: string[];
  codigo: boolean;
  qualCodigo: Codigo;
}

export function camposDaFicha(ficha: Ficha): CamposFicha {
  const simples: string[] = [];
  let ataque = false;
  let efeitoAtaque: EfeitoAtaque = "preciso";
  let defesa = false;
  let efeitoDefesa: EfeitoDefesa = "esquiva";
  let alcance = false;
  let pontosAlcance: 1 | 2 = 1;
  let maestria = false;
  let periciaMaestria: Pericia = "luta";

  for (const vantagem of ficha.vantagens) {
    if (vantagemSimples(vantagem)) {
      simples.push(vantagem.tipo);
      continue;
    }
    if (vantagem.tipo === "ataqueEspecial" && !ataque) {
      ataque = true;
      efeitoAtaque = vantagem.efeito;
    } else if (vantagem.tipo === "defesaEspecial" && !defesa) {
      defesa = true;
      efeitoDefesa = vantagem.efeito;
    } else if (vantagem.tipo === "alcance" && !alcance) {
      alcance = true;
      pontosAlcance = vantagem.pontos;
    } else if (vantagem.tipo === "maestria" && !maestria) {
      maestria = true;
      periciaMaestria = vantagem.pericia;
    }
  }

  const desvantagens: string[] = [];
  let codigo = false;
  let qualCodigo: Codigo = "cacador";
  for (const desvantagem of ficha.desvantagens) {
    if (desvantagemSimples(desvantagem)) {
      desvantagens.push(desvantagem.tipo);
    } else if (desvantagem.tipo === "codigo" && !codigo) {
      codigo = true;
      qualCodigo = desvantagem.codigo;
    }
  }

  return {
    poder: ficha.poder,
    habilidade: ficha.habilidade,
    resistencia: ficha.resistencia,
    pericias: [...ficha.pericias],
    simples,
    ataque,
    efeitoAtaque,
    defesa,
    efeitoDefesa,
    alcance,
    pontosAlcance,
    maestria,
    periciaMaestria,
    desvantagens,
    codigo,
    qualCodigo,
  };
}

function vantagemSimples(vantagem: Vantagem): vantagem is { tipo: "agil" | "anulacao" | "carismatico" | "forte" | "genio" | "resoluto" | "vigoroso" } {
  return VANTAGENS_SIMPLES.has(vantagem.tipo);
}

function desvantagemSimples(desvantagem: Desvantagem): desvantagem is { tipo: "antipatico" | "atrapalhado" | "fracote" | "fragil" | "indeciso" | "infame" | "tapado" } {
  return DESVANTAGENS_SIMPLES.has(desvantagem.tipo);
}
