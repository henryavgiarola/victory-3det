export const PERICIAS = [
  "animais",
  "arte",
  "conhecimento",
  "esporte",
  "influencia",
  "luta",
  "manha",
  "maquinas",
  "medicina",
  "mistica",
  "percepcao",
  "sustento",
] as const;

export type Pericia = (typeof PERICIAS)[number];

export type EfeitoAtaque =
  | "espiritual"
  | "potente"
  | "penetrante"
  | "perigoso"
  | "preciso";

export type EfeitoDefesa = "esquiva" | "reflexao" | "robusta" | "tenaz";

export type Codigo = "cacador" | "combate" | "derrota" | "herois";

export type Vantagem =
  | { tipo: "agil" }
  | { tipo: "anulacao" }
  | { tipo: "alcance"; pontos: 1 | 2 }
  | { tipo: "ataqueEspecial"; efeito: EfeitoAtaque; graus?: number }
  | { tipo: "carismatico" }
  | { tipo: "defesaEspecial"; efeito: EfeitoDefesa; graus?: number }
  | { tipo: "forte" }
  | { tipo: "genio" }
  | { tipo: "maestria"; pericia: Pericia }
  | { tipo: "resoluto" }
  | { tipo: "vigoroso" };

export type Desvantagem =
  | { tipo: "antipatico" }
  | { tipo: "atrapalhado" }
  | { tipo: "codigo"; codigo: Codigo }
  | { tipo: "fracote" }
  | { tipo: "fragil" }
  | { tipo: "indeciso" }
  | { tipo: "infame" }
  | { tipo: "tapado" };

export interface Ficha {
  poder: number;
  habilidade: number;
  resistencia: number;
  pericias: Pericia[];
  vantagens: Vantagem[];
  desvantagens: Desvantagem[];
}

export interface FichaAprovada {
  ok: true;
  pontosGastos: number;
  pool: number;
  pa: number;
  pm: number;
  pv: number;
}

export interface FichaRecusada {
  ok: false;
  motivos: string[];
}

export type ResultadoFicha = FichaAprovada | FichaRecusada;
