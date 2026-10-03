import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export interface ResumoInscricao {
  id: string;
  nome: string;
  conceito: string;
  status: string;
  motivos: string[];
}

export async function listarMinhasFichas(): Promise<ResumoInscricao[]> {
  const jar = await cookies();
  const token = jar.get("sessao")?.value;
  const base = process.env.API_URL;
  if (!token || !base) {
    redirect("/api/sessao/login");
  }

  const resposta = await fetch(new URL("/inscricoes", base), {
    headers: { authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (resposta.status === 401) {
    redirect("/api/sessao/logout");
  }
  if (!resposta.ok) {
    throw new Error(`GET /inscricoes respondeu ${resposta.status}.`);
  }
  return (await resposta.json()) as ResumoInscricao[];
}
