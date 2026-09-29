import { Module } from "@nestjs/common";
import { FichasPublicasController } from "./fichas-publicas.controller";
import { InscricoesRepository } from "./inscricoes.repository";

@Module({
  controllers: [FichasPublicasController],
  providers: [InscricoesRepository],
})
export class AppModule {}
