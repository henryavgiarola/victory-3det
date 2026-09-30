import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { validarFicha } from "@victory/rules";
import { Worker } from "bullmq";
import { conexaoRedis } from "./fila-validacao";
import { InscricoesRepository } from "./inscricoes.repository";

const ATRASO_MS = 1000;

@Injectable()
export class WorkerValidacao implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WorkerValidacao.name);
  private worker: Worker | undefined;

  constructor(private readonly inscricoes: InscricoesRepository) {}

  onModuleInit(): void {
    this.worker = new Worker(
      "validar-ficha",
      async (job) => {
        const id = typeof job.data?.id === "string" ? job.data.id : "";
        const linha = id ? await this.inscricoes.buscar(id) : undefined;
        if (!linha?.correlationId) {
          return;
        }
        await this.inscricoes.marcarProcessamento(id);
        if (process.env.NODE_ENV !== "production") {
          await new Promise((resolver) => setTimeout(resolver, ATRASO_MS));
        }
        const calculo = validarFicha(linha.ficha);
        if (calculo.ok) {
          await this.inscricoes.concluir(id, "aprovada", []);
          this.logger.log(`correlationId=${linha.correlationId} id=${id} status=aprovada`);
          return;
        }
        await this.inscricoes.concluir(id, "recusada", calculo.motivos);
        this.logger.log(`correlationId=${linha.correlationId} id=${id} status=recusada`);
      },
      { connection: conexaoRedis() },
    );
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker?.close();
  }
}
