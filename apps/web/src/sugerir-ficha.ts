import { PERICIAS } from "@victory/rules";
import { interpretarSugestao, type SugestaoInterpretada } from "./interpretar-sugestao";

export const TETO_DESCRICAO = 2000;

const TIPOS_VANTAGEM = ["agil", "anulacao", "alcance", "ataqueEspecial", "carismatico", "defesaEspecial", "forte", "genio", "maestria", "resoluto", "vigoroso"];
const TIPOS_DESVANTAGEM = ["antipatico", "atrapalhado", "codigo", "fracote", "fragil", "indeciso", "infame", "tapado"];
const EFEITOS_ATAQUE = ["espiritual", "potente", "penetrante", "perigoso", "preciso"];
const EFEITOS_DEFESA = ["esquiva", "reflexao", "robusta", "tenaz"];
const CODIGOS = ["cacador", "combate", "derrota", "herois"];

export class SugestaoIndisponivel extends Error {}

export interface RespostaSugestao {
  status: number;
  corpo: unknown;
}

export function lerDescricao(corpo: unknown): string | null {
  if (!ehObjeto(corpo) || typeof corpo.descricao !== "string") {
    return null;
  }
  const descricao = corpo.descricao.trim();
  if (!descricao || descricao.length > TETO_DESCRICAO) {
    return null;
  }
  return descricao;
}

export async function sugerirFicha(descricao: string, pedir: (pedido: string) => Promise<unknown>): Promise<SugestaoInterpretada> {
  const bruto = await pedir(pedidoInicial(descricao));
  const primeira = interpretarSugestao(bruto);
  if (primeira.motivos.length === 0) {
    return primeira;
  }
  return interpretarSugestao(await pedir(pedidoCorrecao(descricao, primeira.motivos, bruto)));
}

export async function responderSugestao(autenticado: boolean, corpo: unknown, pedir: (pedido: string) => Promise<unknown>): Promise<RespostaSugestao> {
  if (!autenticado) {
    return { status: 401, corpo: null };
  }
  const descricao = lerDescricao(corpo);
  if (!descricao) {
    return { status: 400, corpo: { mensagem: `Informe uma descrição de até ${TETO_DESCRICAO} caracteres.` } };
  }
  try {
    const resultado = await sugerirFicha(descricao, pedir);
    if (!resultado.ficha) {
      return { status: 422, corpo: { motivos: resultado.motivos } };
    }
    return { status: 200, corpo: { ficha: resultado.ficha, motivos: resultado.motivos } };
  } catch (erro) {
    if (erro instanceof SugestaoIndisponivel) {
      return { status: 502, corpo: { mensagem: "A sugestão não está disponível." } };
    }
    throw erro;
  }
}

export async function pedirAoOllama(pedido: string): Promise<unknown> {
  const base = process.env.OLLAMA_URL;
  const model = process.env.OLLAMA_MODEL;
  if (!base || !model) {
    throw new SugestaoIndisponivel();
  }
  let resposta: Response;
  try {
    resposta = await fetch(new URL("/api/chat", base), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model,
        stream: false,
        format: "json",
        messages: [{ role: "user", content: pedido }],
      }),
      signal: AbortSignal.timeout(60_000),
    });
  } catch {
    throw new SugestaoIndisponivel();
  }
  if (!resposta.ok) {
    throw new SugestaoIndisponivel();
  }
  let json: unknown;
  try {
    json = await resposta.json();
  } catch {
    throw new SugestaoIndisponivel();
  }
  if (!ehObjeto(json) || !ehObjeto(json.message) || typeof json.message.content !== "string") {
    throw new SugestaoIndisponivel();
  }
  try {
    return JSON.parse(json.message.content) as unknown;
  } catch {
    return json.message.content;
  }
}

function pedidoInicial(descricao: string): string {
  return [
    "Monte uma ficha em JSON a partir da descrição.",
    "Responda só o objeto, sem texto em volta.",
    "Campos: poder, habilidade, resistencia, pericias, vantagens, desvantagens.",
    `Perícias: ${PERICIAS.join(", ")}.`,
    `Vantagens: ${TIPOS_VANTAGEM.join(", ")}.`,
    "alcance usa pontos 1 ou 2.",
    `ataqueEspecial usa efeito ${EFEITOS_ATAQUE.join(", ")} e graus opcional.`,
    `defesaEspecial usa efeito ${EFEITOS_DEFESA.join(", ")} e graus opcional.`,
    "maestria usa pericia da lista de perícias.",
    `Desvantagens: ${TIPOS_DESVANTAGEM.join(", ")}.`,
    `codigo usa um destes: ${CODIGOS.join(", ")}.`,
    `Descrição: ${descricao}`,
  ].join("\n");
}

function pedidoCorrecao(descricao: string, motivos: string[], anterior: unknown): string {
  return [pedidoInicial(descricao), `Resposta anterior: ${JSON.stringify(anterior)}`, `Motivos: ${motivos.join(" ")}`, "Corrija e responda só o objeto JSON."].join("\n");
}

function ehObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}
