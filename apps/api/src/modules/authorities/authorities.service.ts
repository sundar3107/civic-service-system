import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class AuthoritiesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAssignedRegion(userId: string) {
    return this.prisma.authority.findUnique({
      where: { userId },
      include: {
        assignments: {
          include: {
            district: true,
            city: true
          }
        }
      }
    });
  }
}

