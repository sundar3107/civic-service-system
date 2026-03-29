import { Module } from "@nestjs/common";
import { PrismaModule } from "../../common/prisma/prisma.module";
import { AuthoritiesController } from "./authorities.controller";
import { AuthoritiesService } from "./authorities.service";

@Module({
  imports: [PrismaModule],
  controllers: [AuthoritiesController],
  providers: [AuthoritiesService]
})
export class AuthoritiesModule {}
