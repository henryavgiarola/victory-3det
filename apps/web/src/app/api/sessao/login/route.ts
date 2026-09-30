import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { configuracaoAuth, redirectUri } from "../../../../auth";

export async function GET() {
  const { publico, realm, clientId, appUrl } = configuracaoAuth();
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const state = randomBytes(16).toString("base64url");
  const destino = new URL(`/realms/${realm}/protocol/openid-connect/auth`, publico);
  destino.searchParams.set("client_id", clientId);
  destino.searchParams.set("response_type", "code");
  destino.searchParams.set("scope", "openid");
  destino.searchParams.set("redirect_uri", redirectUri(appUrl));
  destino.searchParams.set("state", state);
  destino.searchParams.set("code_challenge", challenge);
  destino.searchParams.set("code_challenge_method", "S256");

  const resposta = NextResponse.redirect(destino);
  resposta.cookies.set("pkce", JSON.stringify({ state, verifier }), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return resposta;
}
