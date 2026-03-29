import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "../../common/prisma/prisma.module";
import { AuditModule } from "../audit/audit.module";
import { ComplaintsController } from "./complaints.controller";
import { ComplaintsService } from "./complaints.service";
import { DuplicateDetectionService } from "./duplicate-detection.service";
import { MediaService } from "./media.service";

@Module({
  imports: [ConfigModule, PrismaModule, AuditModule],
  controllers: [ComplaintsController],
  providers: [ComplaintsService, DuplicateDetectionService, MediaService],
  exports: [ComplaintsService]
})
export class ComplaintsModule {}
