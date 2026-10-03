import { NextResponse } from "next/server";
import { limparSessao } from "../../../auth";
import { gravarPerfil, lerPerfilDoToken, tokenSeUtilizavel } from "../../../perfil";

function negar(): NextResponse {
  const resposta = new NextResponse(null, { status: 401 });
  limparSessao(resposta);
  return resposta;
}

export async function GET() {
  const token = await tokenSeUtilizavel();
  if (!token) {
    return negar();
  }
  const leitura = await lerPerfilDoToken(token);
  if (leitura.status === 401) {
    return negar();
  }
  if (!leitura.perfil) {
    return NextResponse.json({ mensagem: "Não foi possível ler a conta." }, { status: 502 });
  }
  return NextResponse.json(leitura.perfil);
}

export async function POST(requisicao: Request) {
  const token = await tokenSeUtilizavel();
  if (!token) {
    return negar();
  }
  const corpo = (await requisicao.json()) as { nome?: unknown; sobrenome?: unknown };
  const nome = typeof corpo.nome === "string" ? corpo.nome.trim() : "";
  const sobrenome = typeof corpo.sobrenome === "string" ? corpo.sobrenome.trim() : "";
  if (!nome || !sobrenome) {
    return NextResponse.json({ mensagem: "Informe nome e sobrenome." }, { status: 400 });
  }
  const status = await gravarPerfil(token, nome, sobrenome);
  if (status === 401) {
    return negar();
  }
  if (status < 200 || status >= 300) {
    return NextResponse.json({ mensagem: "Não foi possível gravar a conta." }, { status: 502 });
  }
  return NextResponse.json({ nome, sobrenome });
}
