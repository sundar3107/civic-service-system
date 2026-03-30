import { PrismaClient, Role } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  const tamilNaduLocations = [
    { district: "Chennai", cities: ["Chennai", "Alandur", "Ambattur", "Madhavaram"] },
    { district: "Vellore", cities: ["Vellore", "Gudiyatham", "Katpadi", "Pernambut"] },
    { district: "Tiruvannamalai", cities: ["Tiruvannamalai", "Arani", "Vandavasi", "Polur", "Chengam", "Cheyyar"] },
    { district: "Coimbatore", cities: ["Coimbatore", "Pollachi", "Mettupalayam", "Sulur", "Valparai", "Madukkarai"] }
  ];

  const createdCities = new Map<string, { districtId: string; cityId: string }>();

  for (const entry of tamilNaduLocations) {
    const district = await prisma.district.upsert({
      where: { name: entry.district },
      update: {},
      create: { name: entry.district }
    });

    for (const cityName of entry.cities) {
      const city = await prisma.city.upsert({
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

      createdCities.set(`${entry.district}:${cityName}`, {
        districtId: district.id,
        cityId: city.id
      });
    }
  }

  const categories = [
    {
      code: "POTHOLE",
      title: "Pothole",
      bannerTitle: "Road Damage",
      description: "Report dangerous potholes and road cave-ins.",
      fieldsJson: [{ key: "roadName", label: "Road name", type: "text", required: false }]
    },
    {
      code: "ROADSIDE_GARBAGE",
      title: "Roadside Garbage",
      bannerTitle: "Garbage Hotspot",
      description: "Report unmanaged garbage piles near streets and communities.",
      fieldsJson: [{ key: "landmark", label: "Nearby landmark", type: "text", required: false }]
    },
    {
      code: "BROKEN_STREETLIGHT",
      title: "Broken Streetlight",
      bannerTitle: "Streetlight Failure",
      description: "Report non-working or damaged streetlights.",
      fieldsJson: [{ key: "poleNumber", label: "Pole number", type: "text", required: false }]
    },
    {
      code: "WATER_LOGGING",
      title: "Water Logging",
      bannerTitle: "Stagnant Water",
      description: "Report water logging, drains, or stagnant water pockets.",
      fieldsJson: [{ key: "waterDepth", label: "Water depth estimate", type: "text", required: false }]
    },
    {
      code: "ILLEGAL_DUMPING",
      title: "Illegal Dumping",
      bannerTitle: "Illegal Dumping",
      description: "Report illegal dumping of waste or debris.",
      fieldsJson: [{ key: "wasteType", label: "Waste type", type: "text", required: false }]
    },
    {
      code: "WEAK_INFRASTRUCTURE",
      title: "Weak Infrastructure",
      bannerTitle: "Infrastructure Risk",
      description: "Report weak public infrastructure that may become unsafe.",
      fieldsJson: [{ key: "structureType", label: "Structure type", type: "text", required: false }]
    },
    {
      code: "OTHERS",
      title: "Others",
      bannerTitle: "Other Civic Issue",
      description: "Report any other civic issue for municipal attention.",
      fieldsJson: [{ key: "customType", label: "Issue subtype", type: "text", required: true }]
    }
  ];

  for (const category of categories) {
    await prisma.issueCategory.upsert({
      where: { code: category.code },
      update: category,
      create: category
    });
  }

  const authoritySeeds = [
    {
      email: "authority.chennai@tn.gov",
      username: "authority-chennai",
      displayName: "Chennai Municipal Office",
      district: "Chennai",
      city: "Chennai"
    },
    {
      email: "authority.vellore@tn.gov",
      username: "authority-vellore",
      displayName: "Vellore Municipal Office",
      district: "Vellore",
      city: "Katpadi"
    },
    {
      email: "authority.tiruvannamalai@tn.gov",
      username: "authority-tiruvannamalai",
      displayName: "Tiruvannamalai Municipal Office",
      district: "Tiruvannamalai",
      city: "Tiruvannamalai"
    },
    {
      email: "authority.coimbatore@tn.gov",
      username: "authority-coimbatore",
      displayName: "Coimbatore Municipal Office",
      district: "Coimbatore",
      city: "Coimbatore"
    }
  ];

  for (const authoritySeed of authoritySeeds) {
    const authorityUser = await prisma.user.upsert({
      where: { email: authoritySeed.email },
      update: {},
      create: {
        email: authoritySeed.email,
        role: Role.AUTHORITY,
        emailVerifiedAt: new Date(),
        username: authoritySeed.username,
        passwordHash: await argon2.hash("Authority@123")
      }
    });

    const authority = await prisma.authority.upsert({
      where: { userId: authorityUser.id },
      update: { displayName: authoritySeed.displayName },
      create: {
        userId: authorityUser.id,
        displayName: authoritySeed.displayName
      }
    });

    const assignment = createdCities.get(`${authoritySeed.district}:${authoritySeed.city}`);
    if (!assignment) {
      continue;
    }

    await prisma.authorityAssignment.upsert({
      where: {
        authorityId_cityId: {
          authorityId: authority.id,
          cityId: assignment.cityId
        }
      },
      update: {
        districtId: assignment.districtId
      },
      create: {
        authorityId: authority.id,
        districtId: assignment.districtId,
        cityId: assignment.cityId
      }
    });
  }
}

main()
  .catch(async (error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
