import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  type OnModuleInit,
} from "@nestjs/common";

interface Requisicao {
  headers: { authorization?: string };
  usuario?: { sub: string };
}

@Injectable()
export class JwtGuard implements CanActivate, OnModuleInit {
  private verificar: ((token: string) => Promise<string>) | undefined;

  async onModuleInit(): Promise<void> {
    const uri = process.env.JWKS_URI;
    const emissor = process.env.JWT_ISSUER;
    const audiencia = process.env.JWT_AUDIENCE;
    if (!uri || !emissor || !audiencia) {
      throw new Error("JWKS_URI, JWT_ISSUER ou JWT_AUDIENCE ausente.");
    }
    const jose = await import("jose");
    const chaves = jose.createRemoteJWKSet(new URL(uri));
    this.verificar = async (token: string) => {
      const { payload } = await jose.jwtVerify(token, chaves, {
        issuer: emissor,
        audience: audiencia,
      });
      if (!payload.sub) {
        throw new UnauthorizedException();
      }
      return payload.sub;
    };
  }

  async canActivate(contexto: ExecutionContext): Promise<boolean> {
    const requisicao = contexto.switchToHttp().getRequest<Requisicao>();
    const cabecalho = requisicao.headers.authorization ?? "";
    const [esquema, token] = cabecalho.split(" ");
    if (esquema !== "Bearer" || !token || !this.verificar) {
      throw new UnauthorizedException();
    }
    try {
      requisicao.usuario = { sub: await this.verificar(token) };
      return true;
    } catch (erro) {
      if (erro instanceof UnauthorizedException) {
        throw erro;
      }
      throw new UnauthorizedException();
    }
  }
}
