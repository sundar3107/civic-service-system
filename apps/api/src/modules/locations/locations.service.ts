import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";

const TAMIL_NADU_LOCATIONS = [
  { district: "Chennai", cities: ["Chennai", "Alandur", "Ambattur", "Madhavaram"] },
  { district: "Vellore", cities: ["Vellore", "Gudiyatham", "Katpadi", "Pernambut"] },
  { district: "Tiruvannamalai", cities: ["Tiruvannamalai", "Arani", "Vandavasi", "Polur", "Chengam", "Cheyyar"] },
  { district: "Coimbatore", cities: ["Coimbatore", "Pollachi", "Mettupalayam", "Sulur", "Valparai", "Madukkarai"] }
] as const;

@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService) {}

  async listDistricts() {
    await this.ensureReferenceLocations();

    return this.prisma.district.findMany({
      where: {
        name: {
          in: TAMIL_NADU_LOCATIONS.map((entry) => entry.district)
        }
      },
      include: {
        cities: {
          where: {
            name: {
              in: TAMIL_NADU_LOCATIONS.flatMap((entry) => entry.cities)
            }
          },
          orderBy: {
            name: "asc"
          }
        }
      },
      orderBy: {
        name: "asc"
      }
    });
  }

  private async ensureReferenceLocations() {
    for (const entry of TAMIL_NADU_LOCATIONS) {
      const district = await this.prisma.district.upsert({
        where: { name: entry.district },
        update: {},
        create: { name: entry.district }
      });

      for (const cityName of entry.cities) {
        await this.prisma.city.upsert({
          where: {
            districtId_name: {
              districtId: district.id,
              name: cityName
            }
          },
          update: {},
          create: {
            districtId: district.id,
            name: cityName
          }
        });
      }
    }
  }
}
