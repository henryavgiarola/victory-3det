export interface FichaPublica {
  nome: string;
  conceito: string;
  poder: number;
  habilidade: number;
  resistencia: number;
  pa: number;
  pm: number;
  pv: number;
}

export async function listarFichasPublicas(): Promise<FichaPublica[]> {
  const base = process.env.API_URL;
  if (!base) {
    throw new Error("API_URL ausente.");
  }

  const resposta = await fetch(new URL("/fichas-publicas", base), { cache: "no-store" });
  if (!resposta.ok) {
    throw new Error(`GET /fichas-publicas respondeu ${resposta.status}.`);
  }

  return (await resposta.json()) as FichaPublica[];
}
