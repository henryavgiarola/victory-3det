import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Ficha } from "@victory/rules";
import { FilaValidacao } from "./fila-validacao";
import { JwtGuard } from "./jwt.guard";
import { InscricoesRepository } from "./inscricoes.repository";

interface RequisicaoAutenticada {
  usuario?: { sub: string };
}

interface Cabecalho {
  setHeader(nome: string, valor: string): void;
}

@Controller()
export class InscricoesController {
  private readonly logger = new Logger(InscricoesController.name);

  constructor(
    private readonly inscricoes: InscricoesRepository,
    private readonly fila: FilaValidacao,
  ) {}

  @Post("inscricoes")
  @UseGuards(JwtGuard)
  @HttpCode(201)
  async criar(
    @Body() corpo: Record<string, unknown>,
    @Req() requisicao: RequisicaoAutenticada,
    @Res({ passthrough: true }) resposta: Cabecalho,
  ) {
    const sub = requisicao.usuario?.sub;
    if (!sub) {
      throw new BadRequestException();
    }
    const nome = texto(corpo.nome);
    const conceito = texto(corpo.conceito);
    const ficha = fichaDoCorpo(corpo);
    if (!nome || !conceito || !ficha) {
      throw new BadRequestException();
    }

    const correlationId = crypto.randomUUID();
    const id = await this.inscricoes.inserir({ nome, conceito, ficha, sub, correlationId });
    try {
      await this.fila.publicar(id);
    } catch {
      await this.inscricoes.remover(id);
      throw new InternalServerErrorException();
    }
    resposta.setHeader("x-correlation-id", correlationId);
    this.logger.log(`correlationId=${correlationId} id=${id} status=submetida`);
    return { id, status: "submetida" as const };
  }

  @Get("inscricoes/:id")
  @UseGuards(JwtGuard)
  async ler(
    @Param("id") id: string,
    @Req() requisicao: RequisicaoAutenticada,
    @Res({ passthrough: true }) resposta: Cabecalho,
  ) {
    const sub = requisicao.usuario?.sub;
    if (!sub) {
      throw new NotFoundException();
    }
    const linha = await this.inscricoes.buscarDoDono(id, sub);
    if (!linha?.correlationId) {
      throw new NotFoundException();
    }
    resposta.setHeader("x-correlation-id", linha.correlationId);
    return {
      id: linha.id,
      nome: linha.nome,
      conceito: linha.conceito,
      status: linha.status,
      motivos: linha.motivos,
      correlationId: linha.correlationId,
    };
  }
}

function texto(valor: unknown): string | undefined {
  if (typeof valor !== "string") {
    return undefined;
  }
  const limpo = valor.trim();
  return limpo.length > 0 ? limpo : undefined;
}

function fichaDoCorpo(corpo: Record<string, unknown>): Ficha | undefined {
  if (
    !Number.isInteger(corpo.poder) ||
    !Number.isInteger(corpo.habilidade) ||
    !Number.isInteger(corpo.resistencia) ||
    !Array.isArray(corpo.pericias) ||
    !Array.isArray(corpo.vantagens) ||
    !Array.isArray(corpo.desvantagens)
  ) {
    return undefined;
  }
  return {
    poder: corpo.poder as number,
    habilidade: corpo.habilidade as number,
    resistencia: corpo.resistencia as number,
    pericias: corpo.pericias as Ficha["pericias"],
    vantagens: corpo.vantagens as Ficha["vantagens"],
    desvantagens: corpo.desvantagens as Ficha["desvantagens"],
  };
}
