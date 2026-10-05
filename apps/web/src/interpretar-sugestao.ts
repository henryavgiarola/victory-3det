import {
  PERICIAS,
  validarFicha,
  type Codigo,
  type Desvantagem,
  type EfeitoAtaque,
  type EfeitoDefesa,
  type Ficha,
  type Pericia,
  type Vantagem,
} from "@victory/rules";

export interface SugestaoInterpretada {
  ficha: Ficha | null;
  motivos: string[];
}

const CHAVES_FICHA = new Set(["poder", "habilidade", "resistencia", "pericias", "vantagens", "desvantagens"]);
const PERICIAS_CONHECIDAS = new Set<string>(PERICIAS);
const VANTAGENS_SIMPLES = new Set(["agil", "anulacao", "carismatico", "forte", "genio", "resoluto", "vigoroso"]);
const DESVANTAGENS_SIMPLES = new Set(["antipatico", "atrapalhado", "fracote", "fragil", "indeciso", "infame", "tapado"]);
const EFEITOS_ATAQUE = new Set<EfeitoAtaque>(["espiritual", "potente", "penetrante", "perigoso", "preciso"]);
const EFEITOS_DEFESA = new Set<EfeitoDefesa>(["esquiva", "reflexao", "robusta", "tenaz"]);
const CODIGOS = new Set<Codigo>(["cacador", "combate", "derrota", "herois"]);

export function interpretarSugestao(entrada: unknown): SugestaoInterpretada {
  if (!ehObjeto(entrada)) {
    return { ficha: null, motivos: ["A sugestão não é um objeto."] };
  }

  const motivos: string[] = [];
  const sobra = campoAMais(entrada, CHAVES_FICHA);
  if (sobra) {
    motivos.push(`Campo fora da ficha: ${sobra}.`);
  }

  const poder = lerNumero(entrada.poder, "Poder", motivos);
  const habilidade = lerNumero(entrada.habilidade, "Habilidade", motivos);
  const resistencia = lerNumero(entrada.resistencia, "Resistência", motivos);
  const pericias = lerPericias(entrada.pericias, motivos);
  const vantagens = lerLista(entrada.vantagens, "vantagens", lerVantagem, motivos);
  const desvantagens = lerLista(entrada.desvantagens, "desvantagens", lerDesvantagem, motivos);

  if (motivos.length > 0 || poder === null || habilidade === null || resistencia === null || !pericias || !vantagens || !desvantagens) {
    return { ficha: null, motivos };
  }

  const ficha: Ficha = { poder, habilidade, resistencia, pericias, vantagens, desvantagens };
  const resultado = validarFicha(ficha);
  return { ficha, motivos: resultado.ok ? [] : resultado.motivos };
}

function lerPericias(valor: unknown, motivos: string[]): Pericia[] | null {
  if (!Array.isArray(valor)) {
    motivos.push("Perícias não são uma lista.");
    return null;
  }
  const pericias: Pericia[] = [];
  for (const item of valor) {
    if (typeof item !== "string" || !PERICIAS_CONHECIDAS.has(item)) {
      motivos.push(`Perícia desconhecida na leitura: ${String(item)}.`);
      return null;
    }
    pericias.push(item as Pericia);
  }
  return pericias;
}

function lerVantagem(valor: unknown, motivos: string[]): Vantagem | null {
  if (!ehObjeto(valor) || typeof valor.tipo !== "string") {
    motivos.push("Vantagem ilegível.");
    return null;
  }
  if (VANTAGENS_SIMPLES.has(valor.tipo)) {
    const sobra = campoAMais(valor, new Set(["tipo"]));
    if (sobra) {
      motivos.push(`Campo fora da vantagem: ${sobra}.`);
      return null;
    }
    return { tipo: valor.tipo } as Vantagem;
  }
  if (valor.tipo === "alcance") {
    const sobra = campoAMais(valor, new Set(["tipo", "pontos"]));
    if (sobra) {
      motivos.push(`Campo fora da vantagem: ${sobra}.`);
      return null;
    }
    if (valor.pontos !== 1 && valor.pontos !== 2) {
      motivos.push("Alcance só aceita 1 ou 2 pontos na leitura.");
      return null;
    }
    return { tipo: "alcance", pontos: valor.pontos };
  }
  if (valor.tipo === "ataqueEspecial" || valor.tipo === "defesaEspecial") {
    return lerGradual(valor, motivos);
  }
  if (valor.tipo === "maestria") {
    const sobra = campoAMais(valor, new Set(["tipo", "pericia"]));
    if (sobra) {
      motivos.push(`Campo fora da vantagem: ${sobra}.`);
      return null;
    }
    if (typeof valor.pericia !== "string" || !PERICIAS_CONHECIDAS.has(valor.pericia)) {
      motivos.push(`Perícia desconhecida na leitura: ${String(valor.pericia)}.`);
      return null;
    }
    return { tipo: "maestria", pericia: valor.pericia as Pericia };
  }
  motivos.push(`Vantagem desconhecida na leitura: ${valor.tipo}.`);
  return null;
}

function lerGradual(valor: Record<string, unknown>, motivos: string[]): Vantagem | null {
  const sobra = campoAMais(valor, new Set(["tipo", "efeito", "graus"]));
  if (sobra) {
    motivos.push(`Campo fora da vantagem: ${sobra}.`);
    return null;
  }
  const efeitos = valor.tipo === "ataqueEspecial" ? EFEITOS_ATAQUE : EFEITOS_DEFESA;
  if (typeof valor.efeito !== "string" || !efeitos.has(valor.efeito as EfeitoAtaque & EfeitoDefesa)) {
    motivos.push(`Efeito desconhecido na leitura: ${String(valor.efeito)}.`);
    return null;
  }
  if ("graus" in valor && typeof valor.graus !== "number") {
    motivos.push("Graus não são um número.");
    return null;
  }
  if (valor.tipo === "ataqueEspecial") {
    return {
      tipo: "ataqueEspecial",
      efeito: valor.efeito as EfeitoAtaque,
      ...("graus" in valor ? { graus: valor.graus as number } : {}),
    };
  }
  return {
    tipo: "defesaEspecial",
    efeito: valor.efeito as EfeitoDefesa,
    ...("graus" in valor ? { graus: valor.graus as number } : {}),
  };
}

function lerDesvantagem(valor: unknown, motivos: string[]): Desvantagem | null {
  if (!ehObjeto(valor) || typeof valor.tipo !== "string") {
    motivos.push("Desvantagem ilegível.");
    return null;
  }
  if (DESVANTAGENS_SIMPLES.has(valor.tipo)) {
    const sobra = campoAMais(valor, new Set(["tipo"]));
    if (sobra) {
      motivos.push(`Campo fora da desvantagem: ${sobra}.`);
      return null;
    }
    return { tipo: valor.tipo } as Desvantagem;
  }
  if (valor.tipo === "codigo") {
    const sobra = campoAMais(valor, new Set(["tipo", "codigo"]));
    if (sobra) {
      motivos.push(`Campo fora da desvantagem: ${sobra}.`);
      return null;
    }
    if (typeof valor.codigo !== "string" || !CODIGOS.has(valor.codigo as Codigo)) {
      motivos.push(`Código desconhecido na leitura: ${String(valor.codigo)}.`);
      return null;
    }
    return { tipo: "codigo", codigo: valor.codigo as Codigo };
  }
  motivos.push(`Desvantagem desconhecida na leitura: ${valor.tipo}.`);
  return null;
}

function lerLista<T>(valor: unknown, nome: string, lerItem: (item: unknown, motivos: string[]) => T | null, motivos: string[]): T[] | null {
  if (!Array.isArray(valor)) {
    motivos.push(`${nome} não são uma lista.`);
    return null;
  }
  const itens: T[] = [];
  for (const item of valor) {
    const lido = lerItem(item, motivos);
    if (!lido) {
      return null;
    }
    itens.push(lido);
  }
  return itens;
}

function lerNumero(valor: unknown, nome: string, motivos: string[]): number | null {
  if (typeof valor !== "number" || Number.isNaN(valor)) {
    motivos.push(`${nome} não é um número.`);
    return null;
  }
  return valor;
}

function campoAMais(objeto: Record<string, unknown>, permitidas: Set<string>): string | null {
  for (const chave of Object.keys(objeto)) {
    if (!permitidas.has(chave)) {
      return chave;
    }
  }
  return null;
}

function ehObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}
