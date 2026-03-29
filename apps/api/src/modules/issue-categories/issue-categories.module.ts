import { Module } from "@nestjs/common";
import { PrismaModule } from "../../common/prisma/prisma.module";
import { IssueCategoriesController } from "./issue-categories.controller";
import { IssueCategoriesService } from "./issue-categories.service";

@Module({
  imports: [PrismaModule],
  controllers: [IssueCategoriesController],
  providers: [IssueCategoriesService],
  exports: [IssueCategoriesService]
})
export class IssueCategoriesModule {}

