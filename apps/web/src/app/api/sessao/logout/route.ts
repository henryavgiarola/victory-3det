import { NextResponse } from "next/server";
import { configuracaoAuth, limparSessao } from "../../../../auth";

export function GET() {
  const { appUrl } = configuracaoAuth();
  const destino = NextResponse.redirect(new URL("/api/sessao/login", appUrl));
  limparSessao(destino);
  return destino;
}
