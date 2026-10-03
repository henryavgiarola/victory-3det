import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export function configuracaoAuth() {
  const publico = process.env.KEYCLOAK_PUBLIC_URL;
  const interno = process.env.KEYCLOAK_INTERNAL_URL;
  const realm = process.env.KEYCLOAK_REALM;
  const clientId = process.env.KEYCLOAK_CLIENT_ID;
  const appUrl = process.env.APP_URL;
  if (!publico || !interno || !realm || !clientId || !appUrl) {
    throw new Error("Variáveis do Keycloak ausentes.");
  }
  return { publico, interno, realm, clientId, appUrl };
}

export function redirectUri(appUrl: string): string {
  return `${appUrl}/api/sessao/callback`;
}

export function sessaoUtilizavel(token: string | undefined): boolean {
  if (!token) {
    return false;
  }
  const partes = token.split(".");
  if (partes.length !== 3) {
    return false;
  }
  try {
    const json = JSON.parse(Buffer.from(partes[1], "base64url").toString("utf8")) as { exp?: unknown };
    return typeof json.exp === "number" && json.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export async function exigirSessao(): Promise<void> {
  const jar = await cookies();
  if (!sessaoUtilizavel(jar.get("sessao")?.value)) {
    redirect("/api/sessao/login");
  }
}

export function limparSessao(resposta: NextResponse): void {
  resposta.cookies.set("sessao", "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
  resposta.cookies.set("pkce", "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
}
