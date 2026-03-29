import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class DuplicateDetectionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {}

  async findDuplicate(issueCategoryId: string, latitude?: number, longitude?: number) {
    if (latitude === undefined || longitude === undefined) {
      return null;
    }

    const radiusMeters = Number(this.configService.get<string>("DUPLICATE_RADIUS_METERS") ?? 100);
    const tolerance = radiusMeters / 111_320;

    const complaints = await this.prisma.complaint.findMany({
      where: {
        issueCategoryId,
        location: {
          latitude: {
            gte: latitude - tolerance,
            lte: latitude + tolerance
          },
          longitude: {
            gte: longitude - tolerance,
            lte: longitude + tolerance
          }
        }
      },
      include: {
        location: true
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 1
    });

    return complaints[0] ?? null;
  }
}

