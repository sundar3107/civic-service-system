import { Module } from "@nestjs/common";
import { PrismaModule } from "../../common/prisma/prisma.module";
import { AuditModule } from "../audit/audit.module";
import { VotesController } from "./votes.controller";
import { VotesService } from "./votes.service";

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [VotesController],
  providers: [VotesService]
})
export class VotesModule {}

