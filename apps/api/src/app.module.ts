import { Module } from "@nestjs/common";
import { FilaValidacao } from "./fila-validacao";
import { FichasPublicasController } from "./fichas-publicas.controller";
import { InscricoesController } from "./inscricoes.controller";
import { JwtGuard } from "./jwt.guard";
import { InscricoesRepository } from "./inscricoes.repository";

@Module({
  controllers: [FichasPublicasController, InscricoesController],
  providers: [InscricoesRepository, FilaValidacao, JwtGuard],
})
export class AppModule {}
