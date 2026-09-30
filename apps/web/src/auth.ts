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
