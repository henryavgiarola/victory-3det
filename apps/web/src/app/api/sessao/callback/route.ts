import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { configuracaoAuth, redirectUri } from "../../../../auth";

export async function GET(requisicao: Request) {
  const { interno, realm, clientId, appUrl } = configuracaoAuth();
  const url = new URL(requisicao.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const jar = await cookies();
  const bruto = jar.get("pkce")?.value;
  const falha = NextResponse.redirect(new URL("/api/sessao/login", appUrl));
  falha.cookies.set("pkce", "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
  if (!code || !state || !bruto) {
    return falha;
  }

  let guardado: { state?: string; verifier?: string };
  try {
    guardado = JSON.parse(bruto) as { state?: string; verifier?: string };
  } catch {
    return falha;
  }
  if (guardado.state !== state || !guardado.verifier) {
    return falha;
  }

  const corpo = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri(appUrl),
    client_id: clientId,
    code_verifier: guardado.verifier,
  });
  const token = await fetch(
    new URL(`/realms/${realm}/protocol/openid-connect/token`, interno),
    {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: corpo,
    },
  );
  if (!token.ok) {
    return falha;
  }
  const json = (await token.json()) as { access_token?: string; expires_in?: number };
  if (!json.access_token) {
    return falha;
  }

  const destino = NextResponse.redirect(new URL("/", appUrl));
  destino.cookies.set("sessao", json.access_token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: json.expires_in ?? 300,
  });
  destino.cookies.set("pkce", "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
  return destino;
}
