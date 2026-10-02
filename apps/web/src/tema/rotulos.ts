import type { Codigo, EfeitoAtaque, EfeitoDefesa, Pericia } from "@victory/rules";

export const ROTULO_PERICIA: Record<Pericia, string> = {
  animais: "Animais",
  arte: "Arte",
  conhecimento: "Conhecimento",
  esporte: "Esporte",
  influencia: "Influência",
  luta: "Luta",
  manha: "Manha",
  maquinas: "Máquinas",
  medicina: "Medicina",
  mistica: "Mística",
  percepcao: "Percepção",
  sustento: "Sustento",
};

export const ROTULO_VANTAGEM: Record<string, string> = {
  agil: "Ágil",
  anulacao: "Anulação",
  carismatico: "Carismático",
  forte: "Forte",
  genio: "Gênio",
  resoluto: "Resoluto",
  vigoroso: "Vigoroso",
};

export const ROTULO_DESVANTAGEM: Record<string, string> = {
  antipatico: "Antipático",
  atrapalhado: "Atrapalhado",
  fracote: "Fracote",
  fragil: "Frágil",
  indeciso: "Indeciso",
  infame: "Infame",
  tapado: "Tapado",
};

export const ROTULO_ATAQUE: Record<EfeitoAtaque, string> = {
  espiritual: "Espiritual",
  potente: "Potente",
  penetrante: "Penetrante",
  perigoso: "Perigoso",
  preciso: "Preciso",
};

export const ROTULO_DEFESA: Record<EfeitoDefesa, string> = {
  esquiva: "Esquiva",
  reflexao: "Reflexão",
  robusta: "Robusta",
  tenaz: "Tenaz",
};

export const ROTULO_CODIGO: Record<Codigo, string> = {
  cacador: "Caçador",
  combate: "Combate",
  derrota: "Derrota",
  herois: "Heróis",
};

export const ROTULO_STATUS: Record<string, string> = {
  submetida: "Submetida",
  em_processamento: "Em processamento",
  aprovada: "Aprovada",
  recusada: "Recusada",
};
