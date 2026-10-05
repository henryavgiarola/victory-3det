import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { limparSessao, sessaoUtilizavel } from "../../../auth";
import { pedirAoOllama, responderSugestao } from "../../../sugerir-ficha";

export async function POST(requisicao: Request) {
  const jar = await cookies();
  const autenticado = sessaoUtilizavel(jar.get("sessao")?.value);
  let corpo: unknown = null;
  if (autenticado) {
    try {
      corpo = await requisicao.json();
    } catch {
      corpo = null;
    }
  }
  const resultado = await responderSugestao(autenticado, corpo, pedirAoOllama);
  if (resultado.status === 401) {
    const negado = new NextResponse(null, { status: 401 });
    limparSessao(negado);
    return negado;
  }
  return NextResponse.json(resultado.corpo, { status: resultado.status });
}
