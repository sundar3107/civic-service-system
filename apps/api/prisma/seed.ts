import { PrismaClient, Role } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  const district = await prisma.district.upsert({
    where: { name: "Pilot District" },
    update: {},
    create: { name: "Pilot District" }
  });

  const city = await prisma.city.upsert({
    where: {
      districtId_name: {
        districtId: district.id,
        name: "Pilot City"
      }
    },
    update: {},
    create: {
      districtId: district.id,
      name: "Pilot City"
    }
  });

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

  const authorityUser = await prisma.user.upsert({
    where: { email: "authority@pilotcity.gov" },
    update: {},
    create: {
      email: "authority@pilotcity.gov",
      role: Role.AUTHORITY,
      emailVerifiedAt: new Date(),
      username: "pilot-authority",
      passwordHash: await argon2.hash("Authority@123")
    }
  });

  const authority = await prisma.authority.upsert({
    where: { userId: authorityUser.id },
    update: { displayName: "Pilot City Municipal Office" },
    create: {
      userId: authorityUser.id,
      displayName: "Pilot City Municipal Office"
    }
  });

  await prisma.authorityAssignment.upsert({
    where: {
      authorityId_cityId: {
        authorityId: authority.id,
        cityId: city.id
      }
    },
    update: {
      districtId: district.id
    },
    create: {
      authorityId: authority.id,
      districtId: district.id,
      cityId: city.id
    }
  });
}

main()
  .catch(async (error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
