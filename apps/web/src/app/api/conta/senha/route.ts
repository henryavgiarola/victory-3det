import { NextResponse } from "next/server";
import { limparSessao } from "../../../../auth";
import { gravarSenha, tokenSeUtilizavel } from "../../../../perfil";

export async function POST(requisicao: Request) {
  const token = await tokenSeUtilizavel();
  if (!token) {
    const resposta = new NextResponse(null, { status: 401 });
    limparSessao(resposta);
    return resposta;
  }
  const corpo = (await requisicao.json()) as {
    senhaAtual?: unknown;
    senhaNova?: unknown;
    confirmacao?: unknown;
  };
  const senhaAtual = typeof corpo.senhaAtual === "string" ? corpo.senhaAtual : "";
  const senhaNova = typeof corpo.senhaNova === "string" ? corpo.senhaNova : "";
  const confirmacao = typeof corpo.confirmacao === "string" ? corpo.confirmacao : "";
  if (!senhaAtual || !senhaNova || senhaNova !== confirmacao) {
    return NextResponse.json({ mensagem: "A senha nova e a confirmação precisam ser iguais." }, { status: 400 });
  }
  const status = await gravarSenha(token, senhaAtual, senhaNova, confirmacao);
  if (status === 401) {
    const resposta = new NextResponse(null, { status: 401 });
    limparSessao(resposta);
    return resposta;
  }
  if (status < 200 || status >= 300) {
    return NextResponse.json({ mensagem: "Não foi possível alterar a senha." }, { status: 502 });
  }
  return new NextResponse(null, { status: 204 });
}
