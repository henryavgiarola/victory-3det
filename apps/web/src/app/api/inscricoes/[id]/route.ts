import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { limparSessao } from "../../../../auth";

export async function GET(_requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const { id } = await contexto.params;
  const jar = await cookies();
  const token = jar.get("sessao")?.value;
  const api = process.env.API_URL;
  if (!token || !api) {
    const negado = new NextResponse(null, { status: 401 });
    limparSessao(negado);
    return negado;
  }

  const resposta = await fetch(new URL(`/inscricoes/${id}`, api), {
    headers: { authorization: `Bearer ${token}` },
  });
  const headers = new Headers();
  headers.set("content-type", resposta.headers.get("content-type") ?? "application/json");
  const correlationId = resposta.headers.get("x-correlation-id");
  if (correlationId) {
    headers.set("x-correlation-id", correlationId);
  }
  const corpo = await resposta.text();
  if (resposta.status === 401) {
    const negado = new NextResponse(corpo, { status: 401, headers });
    limparSessao(negado);
    return negado;
  }
  return new Response(corpo, { status: resposta.status, headers });
}
