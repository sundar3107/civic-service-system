import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function normalizeLocationText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

async function resolveCityFromLocation(formattedAddress: string | null) {
  const cities = await prisma.city.findMany({
    include: {
      district: true
    }
  });

  if (!formattedAddress) {
    return (
      cities.find(
        (city) =>
          normalizeLocationText(city.district.name) === "vellore" && normalizeLocationText(city.name) === "katpadi"
      ) ?? null
    );
  }

  const normalizedAddress = normalizeLocationText(formattedAddress);

  const cityMatches = cities
    .filter((city) => normalizedAddress.includes(normalizeLocationText(city.name)))
    .sort((left, right) => {
      const leftName = normalizeLocationText(left.name);
      const rightName = normalizeLocationText(right.name);
      const leftIndex = normalizedAddress.indexOf(leftName);
      const rightIndex = normalizedAddress.indexOf(rightName);

      if (leftIndex !== rightIndex) {
        return leftIndex - rightIndex;
      }

      return right.name.length - left.name.length;
    });

  if (cityMatches.length > 0) {
    return cityMatches[0];
  }

  const districtMatches = cities
    .filter((city) => normalizedAddress.includes(normalizeLocationText(city.district.name)))
    .sort((left, right) => right.district.name.length - left.district.name.length);

  if (districtMatches.length > 0) {
    return districtMatches[0];
  }

  return (
    cities.find(
      (city) =>
        normalizeLocationText(city.district.name) === "vellore" && normalizeLocationText(city.name) === "katpadi"
    ) ?? null
  );
}

async function main() {
  const complaints = await prisma.complaint.findMany({
    include: {
      location: true
    }
  });

  for (const complaint of complaints) {
    const routedCity = await resolveCityFromLocation(complaint.location?.formattedAddress ?? null);
    if (!routedCity) {
      continue;
    }

    await prisma.complaint.update({
      where: { id: complaint.id },
      data: {
        cityId: routedCity.id
      }
    });
  }

  console.log(`Updated ${complaints.length} complaint routes.`);
}

main()
  .catch(async (error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
