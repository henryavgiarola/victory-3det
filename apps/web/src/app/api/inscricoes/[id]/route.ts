import { cookies } from "next/headers";

export async function GET(_requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const { id } = await contexto.params;
  const jar = await cookies();
  const token = jar.get("sessao")?.value;
  const api = process.env.API_URL;
  if (!token || !api) {
    return new Response(null, { status: 401 });
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
  return new Response(await resposta.text(), { status: resposta.status, headers });
}
