import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class IssueCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.issueCategory.findMany({
      orderBy: {
        title: "asc"
      }
    });
  }
}

